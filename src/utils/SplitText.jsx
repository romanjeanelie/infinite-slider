const SplitText = ({ text }) => {
  return text.split("").map((letter, index) => {
    return (
      <span key={index} className="letter__mask">
        <span className="letter">{letter}</span>
      </span>
    );
  });
};
export default SplitText;
