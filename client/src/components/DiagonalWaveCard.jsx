
const DiagonalWaveCard = ({
  message = "You must connect to have feeds here",
  highlight = "connect",
  highlightColor = "text-indigo-600",
  bgFrom = "from-gray-500",
  bgTo = "to-gray-100",
  borderColor = "border-gray-500",
  textColor = "text-gray-900",
  animationDuration = 3,
  animationDelay = 5,
  height = "65vh",
  fontSize = "text-2xl",
  width

}) => {
  return (
    <div
      className={`${width} ${height} flex justify-center items-center border ${borderColor} bg-gradient-to-br ${bgFrom} ${bgTo} rounded relative overflow-hidden p-8`}
    >
      {/* Diagonal wave */}
      <div
        className="absolute w-[200%] h-[200%] bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.6),transparent)] animate-wave"
        style={{
          animationDuration: `${animationDuration}s`,
          animationDelay: `${animationDelay}s`
        }}
      />

      {/* Typography */}
      <h1
        className={`${fontSize} font-semibold ${textColor} text-center z-10 tracking-wide`}
      >
        {message.split(" ").map((word, index) =>
          word.toLowerCase() === highlight.toLowerCase() ? (
            <span key={index} className={`${highlightColor} font-bold`}>
              {word}{" "}
            </span>
          ) : (
            word + " "
          )
        )}
      </h1>
    </div>
  );
};

export default DiagonalWaveCard;
