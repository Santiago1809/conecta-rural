import PlanView from "./PlanView";

export const metadata = {
  title: "Tu plan · Conecta Rural",
};

// Server wrapper: the interactive summary lives in the client PlanView.
export default function PlanPage() {
  return <PlanView />;
}
