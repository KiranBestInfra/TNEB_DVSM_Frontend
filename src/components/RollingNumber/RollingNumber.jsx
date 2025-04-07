import { useSpring, animated } from 'react-spring';
import PropTypes from 'prop-types';

function RollingNumber({
    n,
    delay = 200,
    decimals = 0,
    springConfig = { mass: 1, tension: 20, friction: 20 },
}) {
    // Ensure n is a valid number
    const valueToAnimate = typeof n === 'number' && !isNaN(n) ? n : 0;

    const { number } = useSpring({
        from: { number: 0 },
        number: valueToAnimate,
        delay,
        config: springConfig,
    });

    return (
        <animated.div>
            {number.to((num) => parseFloat(num).toFixed(decimals))}
        </animated.div>
    );
}

RollingNumber.propTypes = {
    n: PropTypes.number,
    delay: PropTypes.number,
    decimals: PropTypes.number,
    springConfig: PropTypes.object,
};

export default RollingNumber;
