import { toast } from "react-hot-toast";


export const SuccessNotification = (message: string = 'Success!') => {
    toast.success(message, {
        style: {
            background: '#10b981', // Tailwind green-500
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '8px',
            fontWeight: 500,
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
        },
    });
};

export const ErrorNotification = (message: string = 'Something went wrong') => {
    toast.error(message, {
        style: {
            background: '#ef4444', // Tailwind red-500
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '8px',
            fontWeight: 500,
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
        },
    });
};