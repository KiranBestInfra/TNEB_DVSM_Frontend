import { useSpring, animated } from 'react-spring';
import PropTypes from 'prop-types';

function RollingNumber({
    n,
    delay = 200,
    decimals = 0,
    springConfig = { mass: 1, tension: 20, friction: 20 },
    showDecimals = true,
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
            {number.to((num) => 
                showDecimals ? parseFloat(num).toFixed(decimals) : Math.round(num)
            )}
        </animated.div>
    );
}

RollingNumber.propTypes = {
    n: PropTypes.number,
    delay: PropTypes.number,
    decimals: PropTypes.number,
    springConfig: PropTypes.object,
    showDecimals: PropTypes.bool,
};

export default RollingNumber;
