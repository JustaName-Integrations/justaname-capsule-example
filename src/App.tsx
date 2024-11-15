import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { capsuleConnector } from "@usecapsule/wagmi-v2-integration";
import { OAuthMethod } from "@usecapsule/web-sdk";
import CapsuleWeb, { Environment } from "@usecapsule/react-sdk";
import {
  createConfig,
  WagmiProvider,
  useAccount,
  type CreateConfigParameters,
  useConnect,
  useDisconnect,
} from "wagmi";
import { http } from "wagmi";
import { sepolia } from "wagmi/chains";
import {
  JustWeb3Provider,
  JustWeb3ProviderConfig,
  JustWeb3Button,
} from "@justweb3/widget";
import "@usecapsule/react-sdk/styles.css";
import "@justweb3/widget/styles.css";

export const capsuleClient = new CapsuleWeb(
  Environment.BETA,
  import.meta.env.VITE_CAPSULE_API_KEY
);

const connector = capsuleConnector({
  capsule: capsuleClient,
  chains: [sepolia],
  appName: "JustaName Integration",
  options: {},
  nameOverride: "Capsule",
  idOverride: "capsule",
  oAuthMethods: Object.values(OAuthMethod),
  disableEmailLogin: false,
  disablePhoneLogin: false,
  onRampTestMode: false,
});

const config: CreateConfigParameters = {
  chains: [sepolia],
  connectors: [connector],
  transports: {
    [sepolia.id]: http(),
  },
};

const wagmiProviderConfig = createConfig(config);

const queryClient = new QueryClient();

const justweb3Config: JustWeb3ProviderConfig = {
  config: {
    origin: "http://localhost:3000/",
    domain: "localhost",
    signInTtl: 86400000,
  },
  openOnWalletConnect: true,
  allowedEns: "all",
  logo: "",
  ensDomains: [
    {
      ensDomain: import.meta.env.VITE_JUSTANAME_ENS_DOMAIN,
      apiKey: import.meta.env.VITE_JUSTANAME_API_KEY,
      chainId: 11155111,
    },
  ],
  color: {
    primary: "hsl(216, 90%, 58%)",
    background: "hsl(0, 0%, 100%)",
    destructive: "hsl(0, 100%, 50%)",
  },
  backendUrl: "http://localhost:3333",
};

const AuthContent = () => {
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  console.log("Connectors", connectors);
  console.log("Address", address);
  console.log("IsConnected", isConnected);

  return (
    <div>
      <h1>AuthWithWagmi</h1>
      {isConnected ? (
        <div>
          <p>Connected as {address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      ) : (
        <div>
          {connectors
            .filter((connector) => connector.id === "capsule")
            .map((connector) => (
              <button key={connector.id} onClick={() => connect({ connector })}>
                Connect with {connector.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

const AuthWithWagmi = () => {
  return (
    <WagmiProvider config={wagmiProviderConfig}>
      <QueryClientProvider client={queryClient}>
        <JustWeb3Provider config={justweb3Config}>
          <JustWeb3Button>
            <AuthContent />
          </JustWeb3Button>
        </JustWeb3Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default AuthWithWagmi;
