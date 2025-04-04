import { useSpring, animated } from 'react-spring';

/**
 * RollingNumber - A component that animates number changes with a rolling effect
 * @param {Object} props
 * @param {number} props.n - The target number to display
 * @param {number} [props.delay=200] - Animation delay in ms
 * @param {number} [props.decimals=0] - Number of decimal places to display
 * @param {Object} [props.springConfig] - Custom spring configuration
 * @returns {JSX.Element} Animated number component
 */
function RollingNumber({
    n,
    delay = 200,
    decimals = 0,
    springConfig = { mass: 1, tension: 20, friction: 20 }
}) {
    const { number } = useSpring({
        from: { number: 0 },
        number: n,
        delay,
        config: springConfig,
    });

    return (
        <animated.div>
            {number.to((num) => num.toFixed(decimals))}
        </animated.div>
    );
}

export default RollingNumber;
