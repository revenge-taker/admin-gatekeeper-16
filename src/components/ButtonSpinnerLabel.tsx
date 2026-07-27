export function ButtonSpinnerLabel({ loading }: { loading: boolean }) {
  return loading ? (
    <span className="flex items-center justify-center gap-2">
      <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
      Logging in...
    </span>
  ) : (
    <>Login</>
  );
}
