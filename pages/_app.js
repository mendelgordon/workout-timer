import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { CacheProvider } from '@chakra-ui/next-js'

// Extend the default Chakra UI theme with custom colors, global styles, and color mode config
const theme = extendTheme({
  colors: {
    pink: {
      50: '#FFF5F7',
      100: '#FED7E2',
      200: '#FBB6CE',
      300: '#F687B3',
      400: '#ED64A6',
      500: '#D53F8C',
      600: '#B83280',
      700: '#97266D',
      800: '#702459',
      900: '#521B41',
    },
    red: {
      50: '#FFF5F5',
      100: '#FED7D7',
      200: '#FEB2B2',
      300: '#FC8181',
      400: '#F56565',
      500: '#E53E3E',
      600: '#C53030',
      700: '#9B2C2C',
      800: '#822727',
      900: '#63171B',
    },
    gray: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#171923',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
})

// Ensure all color values are defined
const ensureColorValues = (colors) => {
  const ensureNestedColors = (obj) => {
    return new Proxy(obj, {
      get: (target, prop) => {
        if (prop in target) {
          return typeof target[prop] === 'object'
            ? ensureNestedColors(target[prop])
            : target[prop];
        }
        return '#000000';
      }
    });
  };

  return Object.keys(colors).reduce((acc, color) => {
    acc[color] = ensureNestedColors(colors[color]);
    return acc;
  }, {});
};

theme.colors = ensureColorValues(theme.colors);

function MyApp({ Component, pageProps }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme} resetCSS>
        <Component {...pageProps} />
      </ChakraProvider>
    </CacheProvider>
  )
}

export default MyApp
