// clean = DOMPurify.sanitize(dirty)
// dangerouslySetInnerHTML={{__html: clean }}

console.log(window);

const App = () => {
  const [donation, setDonation] = React.useState(null);
  const [settings, setSettings] = React.useState(null);
  const props = ReactSpring.useSpring(settings);

  console.log("donation", { donation });
  console.log("settings", { settings });
  console.log("props", { props });

  // TODO: re-render on new donation
  function onDonate({ name, message, amount }) {
    setDonation({ name, message, amount });
  }

  // TODO: don't re-render after settings changed
  function onUpdate(settings) {
    setSettings(settings);
  }

  React.useEffect(() => {
    // TODO: use proper streamer, donator and ?animator socket namespaces
    const socket = io("/streamer");

    socket.on("connect", () => {
      socket.emit("XXX_animation_get_settings");
      socket.on("XXX_animation_start_paint", onDonate);
      socket.on("XXX_animation_update_settings", onUpdate);
    });

    socket.on("disconnect", () => {
      socket.off("XXX_animation_start_paint", onDonate);
      socket.off("XXX_animation_update_settings", onUpdate);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="w-3/4 mx-auto">
      <link
        href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css"
        rel="stylesheet"
      />
      <div className="m-3">
        <h1 className="text-2xl">Animation Showcase</h1>
        <h2 className="text-xl">Donation</h2>
        {donation ? (
          <p>
            Name: {donation.name}
            <br />
            Amount: {donation.amount} XMR
            <br />
            Message:
            <div>{donation.message}</div>
          </p>
        ) : null}
      </div>
      <div className="m-3">
        <h2 className="text-xl">Settings</h2>
        {settings ? (
          <p>
            <pre>{JSON.stringify(settings, null, 4)}</pre>
          </p>
        ) : null}
      </div>
      <div className="m-3">
        <h2 className="text-xl my-3">Render</h2>
        <div className="flex">
          {donation ? (
            <div className="text-center border-2 p-3 border-black">
              <ReactSpring.animated.div style={props}>
                <span className="font-bold">{donation.name}</span> tipped{" "}
                <span className="font-bold">{donation.amount} XMR</span>
                <br />
                {donation.message}
              </ReactSpring.animated.div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const container = document.querySelector("#animation");
ReactDOM.render(<App />, container);
