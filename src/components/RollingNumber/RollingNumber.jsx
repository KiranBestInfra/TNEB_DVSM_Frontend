import { useSpring, animated } from 'react-spring';


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
            {number.to((num) => parseFloat(num).toFixed(decimals))}
        </animated.div>
    );
}

export default RollingNumber;
