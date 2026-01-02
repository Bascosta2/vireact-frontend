import { FaSpinner } from 'react-icons/fa'

function ButtonLoader({ text }: { text: string }) {
    return (
        <div className="flex items-center justify-center gap-2">
            <FaSpinner className="w-5 h-5 mr-1 animate-spin" />
            {text}
        </div>
    )
}

export default ButtonLoader