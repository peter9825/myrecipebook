const urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get('message');

if (message) {
  const LoginComponent = () => {
    return (
      <>
      <p>{message}</p>
      </>
    );
  };

  const login = ReactDOM.createRoot(document.getElementById('message'));
  login.render(<LoginComponent />);
}

