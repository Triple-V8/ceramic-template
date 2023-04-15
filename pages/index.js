import { Web3Provider } from "@ethersproject/providers";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { EthereumAuthProvider } from "@self.id/web";
import { useViewerConnection } from "@self.id/react";
import styles from "../styles/Home.module.css";
import { useViewerRecord } from "@self.id/react";

function RecordSetter() {
  const record = useViewerRecord("basicProfile");
  const [name, setName] = useState("");
  const [scope, setScope] = useState("");

  const updateRecord = async (name, scope) => {
    await record.merge({
      name: name,
      scope: scope
    });
  };

  return (
    <div className={styles.content}>
      <div className={styles.mt2}>
        {record.content ? (
          <div className={styles.flexCol}>
             {record.content.name ? (
            <span className={styles.subtitle}>Hello {record.content.name}!</span>)
          : 
          (<span className={styles.subtitle}>You forgot to tell us your name</span>)
          }
          {record.content.scope ? (
            <span className={styles.subtitle}>You are a {record.content.scope}!</span>)
          :
          (<span className={styles.subtitle}>You forgot to tell us what you do</span>)
          }
  
            <span>
              The above name was loaded from Ceramic Network. Try updating it
              below.
            </span>
          </div>
        ) : (
          <span>
            You do not have a profile record attached to your 3ID. Create a basic
            profile by setting a name below.
          </span>
        )}
      </div>
  
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.mt2}
      />
      <input
        type="text"
        placeholder="Scope"
        value={scope}
        onChange={(e) => setScope(e.target.value)}
        className={styles.mt2}
      />
      <button onClick={() => updateRecord(name, scope)}>Update</button>
    </div>
  );
}

function Home() {

const [connection, connect, disconnect] = useViewerConnection();
const web3ModalRef = useRef();

const getProvider = async () => {
  const provider = await web3ModalRef.current.connect();
  const wrappedProvider = new Web3Provider(provider);
  return wrappedProvider;
};

useEffect(() => {
  if (connection.status !== "connected") {
    web3ModalRef.current = new Web3Modal({
      network: "goerli",
      providerOptions: {},
      disableInjectedProvider: false,
    });
  }
}, [connection.status]);

const connectToSelfID = async () => {
  const ethereumAuthProvider = await getEthereumAuthProvider();
  connect(ethereumAuthProvider);
};

const getEthereumAuthProvider = async () => {
  const wrappedProvider = await getProvider();
  const signer = wrappedProvider.getSigner();
  const address = await signer.getAddress();
  return new EthereumAuthProvider(wrappedProvider.provider, address);
};

return (
  <div className={styles.main}>
    <div className={styles.navbar}>
      <span className={styles.title}>Ceramic Demo</span>
      {connection.status === "connected" ? (
        <span className={styles.subtitle}>Connected</span>
      ) : (
        <button
          onClick={connectToSelfID}
          className={styles.button}
          disabled={connection.status === "connecting"}
        >
          Connect
        </button>
      )}
    </div>

    <div className={styles.content}>
      <div className={styles.connection}>
        {connection.status === "connected" ? (
          <div>
            <span className={styles.subtitle}>
              Your 3ID is {connection.selfID.id}
            </span>
            <RecordSetter />
          </div>
        ) : (
          <span className={styles.subtitle}>
            Connect with your wallet to access your 3ID
          </span>
        )}
      </div>
    </div>
  </div>
);
}

export default Home;