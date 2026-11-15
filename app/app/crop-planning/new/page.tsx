import AppShell from "@/components/app/AppShell";
import NewCropCycleForm from "@/components/app/NewCropCycleForm";

export default function NewCropCyclePage() {
  return (
    <AppShell allowed={["farmer", "operations"]}>
      {() => <NewCropCycleForm />}
    </AppShell>
  );
}
