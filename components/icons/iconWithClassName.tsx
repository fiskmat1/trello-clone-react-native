import type { LucideIcon } from 'lucide-react-native';
import tw from 'tailwind-react-native-classnames';


export function iconWithClassName(icon: LucideIcon) {
  return (props: any) => {
    return icon({
      ...props,
      style: [
        props.style,
        tw`text-black opacity-100`, // Example styles using Tailwind classes
      ],
    });
  };
}
