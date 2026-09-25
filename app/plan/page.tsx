import PlanView from "./PlanView";

export const metadata = {
    title: "Mi itinerario · Mi Ruta",
};

// Server wrapper: the interactive summary lives in the client PlanView.
export default function PlanPage() {
  return <PlanView />;
}
