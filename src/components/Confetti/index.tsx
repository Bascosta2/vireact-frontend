import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

interface ConfettiComponentProps {
    width?: number
    height?: number
}

function ConfettiComponent({ width, height }: ConfettiComponentProps) {
    const { width: windowWidth, height: windowHeight } = useWindowSize()

    // Use custom dimensions if provided, otherwise use responsive window dimensions
    const confettiWidth = width ?? windowWidth
    const confettiHeight = height ?? windowHeight

    return (
        <Confetti
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1000,
            }}
            tweenDuration={3000}
            recycle={false}
            width={confettiWidth}
            height={confettiHeight}
        />
    )
}

export default ConfettiComponent