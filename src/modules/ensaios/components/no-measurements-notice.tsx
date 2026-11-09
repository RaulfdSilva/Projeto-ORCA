export function NoMeasurementsNotice({ subject }: { subject: "point" | "test" }) {
  return <p role="note" className="mt-4 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
    {subject === "point" ? "Este ponto" : "Este ensaio"} não possui medições e não contém dados suficientes para análise técnica.
  </p>;
}
