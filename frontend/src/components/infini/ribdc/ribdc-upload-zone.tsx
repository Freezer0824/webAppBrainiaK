import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type RibdcUploadZoneProps = {
  onMockUpload: () => void;
};

export function RibdcUploadZone({ onMockUpload }: RibdcUploadZoneProps) {
  return (
    <div className="rounded-3xl border border-dashed border-cyan-500/30 bg-cyan-500/10 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
            Upload formulaire
          </p>

          <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            Ajouter un formulaire à remplir
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Zone prête pour connecter l’upload réel. Pour la démo, un document
            mock est ajouté automatiquement.
          </p>
        </div>

        <Button
          type="button"
          onClick={onMockUpload}
          className="bg-cyan-500/90 text-black hover:bg-cyan-400"
        >
          <Upload className="mr-2 h-4 w-4" />
          Ajouter un formulaire mock
        </Button>
      </div>
    </div>
  );
}