import '../styles/index.css'

export default function MyApp({ Component, pageProps }) {
  return (
    <div className="container mx-auto">
      <Component {...pageProps} />
    </div>
  );
}
