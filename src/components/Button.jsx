import PropTypes from 'prop-types';

const Button = ({ text }) => {
  return (
    <>
      <button className="inline-flex items-center justify-center h-10 gap-2 px-5 text-sm font-medium tracking-wide text-white transition duration-300 rounded whitespace-nowrap bg-blue-500 hover:bg-blue-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300 disabled:shadow-none">
        <span>{text}</span>
      </button>
    </>
  );
};

Button.propTypes = {
    text: PropTypes.string.isRequired,
    color: PropTypes.string,
};


export default Button;