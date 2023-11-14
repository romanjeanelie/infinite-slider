import { useMemo, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from "react";
import PropTypes from "prop-types";
import { gsap } from "gsap";
import { Lethargy } from "lethargy";
import projects from "@/projects.json";

// Utils
import lerp from "@/utils/lerp";
import useRaf from "@/utils/useRaf";
import SplitText from "@/utils/SplitText";

const Slide = forwardRef(({ index, name, image, totalLength }, ref) => {
  // Config
  const scaleFactor = 0.0012;
  const thresholds = 40;

  // Refs
  const slideRef = useRef();
  const titleRef = useRef();

  const transform = useMemo(
    () => ({
      translate: {
        value: 0,
        isBefore: false,
        isAfter: false,
        extra: 0,
        scale: 0,
      },
      scale: {
        value: 0,
      },
    }),
    []
  );

  const totalWidth = totalLength * 100;

  const updatePositions = () => {
    const { translate, scale } = transform;
    slideRef.current.style.transform = `translateX(${translate.value}%) scale(${scale.value})`;
  };
  const onScroll = (scrollPosition, scrollDirection, scrollVelocity) => {
    const { translate, scale } = transform;
    translate.value = index * 100 - scrollPosition - translate.extra;

    translate.isBefore = translate.value < -100;
    translate.isAfter = translate.value > 100;
    translate.isEnter = translate.value > -thresholds && translate.value < thresholds;

    if (translate.isEnter) {
      slideRef.current.classList.add("show");
    } else {
      slideRef.current.classList.remove("show");
    }

    scale.value = 1 - Math.abs(scrollVelocity * scaleFactor);

    if (scrollDirection === "down" && translate.isBefore) {
      translate.extra -= totalWidth;
      translate.isBefore = false;
      translate.isAfter = false;
    }

    if (scrollDirection === "up" && translate.isAfter) {
      translate.extra += totalWidth;
      translate.isBefore = false;
      translate.isAfter = false;
    }

    updatePositions();
  };

  useImperativeHandle(ref, () => ({
    onScroll,
  }));

  return (
    <div ref={slideRef} className="slide__container">
      <div className="slide">
        <h2 ref={titleRef} className="title">
          <SplitText text={name} />
        </h2>
        <img src={image} alt="building" />
      </div>
    </div>
  );
});

Slide.displayName = "Slide";
Slide.propTypes = {
  index: PropTypes.number.isRequired,
  totalLength: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};

function Slider() {
  // Config
  const scrollConfig = useMemo(
    () => ({
      speed: 0.1,
      ease: 0.06,
    }),
    []
  );

  const nbSlides = 7;

  const scroll = useMemo(
    () => ({
      currentPosition: 0,
      nextPosition: 0,
      lerped: 0,
      velocity: 0,
      velocityLerped: 0,
      direction: null,
      isActive: false,
    }),
    []
  );

  // Refs
  const slidesRefs = useRef([]);

  useRaf(() => {
    scroll.lerped = lerp(scroll.lerped, scroll.nextPosition, scrollConfig.ease);
    scroll.velocityLerped = lerp(scroll.velocityLerped, scroll.velocity, 0.03);

    slidesRefs.current.forEach((slide) => {
      slide.onScroll(scroll.lerped, scroll.direction, scroll.velocityLerped);
    });
  });

  const lethargy = useRef(new Lethargy());

  const checkIsScrolling = useCallback(
    (e) => {
      const scrollCheck = lethargy.current.check(e);
      scroll.isActive = typeof scrollCheck === "number" || false;
    },
    [scroll]
  );

  const onScroll = useCallback(
    (e) => {
      checkIsScrolling(e);
      scroll.velocity = e.deltaY;

      if (scroll.isActive) {
        scroll.currentPosition += e.deltaY * scrollConfig.speed;
        scroll.nextPosition = scroll.currentPosition;
      } else {
        const target = gsap.utils.snap(100, scroll.currentPosition);
        scroll.nextPosition = target;
        scroll.currentPosition = scroll.nextPosition;
      }
      scroll.direction = e.deltaY > 0 ? "down" : "up";
    },
    [checkIsScrolling, scroll, scrollConfig]
  );

  useEffect(() => {
    window.addEventListener("wheel", onScroll);
    return () => window.removeEventListener("wheel", onScroll);
  }, [onScroll]);

  return (
    <>
      <div className="top">
        Architecture Projects <span className="date">© 2023</span>
      </div>
      <div className="slider__container">
        {projects.reverse().map((project, i) => (
          <Slide
            key={i}
            ref={(el) => (slidesRefs.current[i] = el)}
            totalLength={nbSlides}
            index={i}
            name={project.name}
            image={project.image}
          />
        ))}
      </div>
      <div className="bottom">
        <ul>
          <li>
            <h3>Explore</h3>
            <p>Scroll down to explore our projects</p>
          </li>
          <li>
            <h3>Credits</h3>
            <a href="https://twitter.com/romanjeanelie" target="_blank" rel="noreferrer">
              @romanjeanelie
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Slider;
