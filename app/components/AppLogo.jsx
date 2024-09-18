import { Image } from 'react-native';

import Logo from '@/assets/logo.png';

const AppLogo = ({style}) => (
    <Image className="h-[50px]" style={style} source={Logo} resizeMode="contain" />
);

export default AppLogo;
