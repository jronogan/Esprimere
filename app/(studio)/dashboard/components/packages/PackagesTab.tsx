"use client";

import { useState } from "react";
import type { PassPackageDTO } from "@/lib/types";
import PackageTable from "./PackageTable";
import AddPackageModal from "./AddPackageModal";
import EditPackageModal from "./EditPackageModal";

type Props = { studioId: string; passPackages: PassPackageDTO[] };

export default function PackagesTab({ studioId, passPackages }: Props) {
  const credits = passPackages.filter((p) => p.type === "CREDITS");
  const unlimited = passPackages.filter((p) => p.type === "UNLIMITED");

  const [addOpen, setAddOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<PassPackageDTO | null>(null);

  return (
    <div>
      <h1 className="text-[16px] font-medium text-gray-900">Class packages</h1>
      <p className="text-[13px] text-gray-500 mt-0.5 mb-5">
        Configure pass types and pricing
      </p>

      <div className="mb-4">
        <PackageTable
          title="Credit passes"
          packages={credits}
          secondCol={{
            header: "Credits",
            value: (p) => String(p.credits ?? "—"),
          }}
          showAddButton
          onAdd={() => setAddOpen(true)}
          onEdit={(p) => setEditPkg(p)}
        />
      </div>

      {unlimited.length > 0 && (
        <PackageTable
          title="Unlimited passes"
          packages={unlimited}
          secondCol={{ header: "Type", value: () => "Unlimited" }}
          onEdit={(p) => setEditPkg(p)}
        />
      )}

      <AddPackageModal
        studioId={studioId}
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
      />

      <EditPackageModal
        studioId={studioId}
        pkg={editPkg}
        isOpen={editPkg !== null}
        onClose={() => setEditPkg(null)}
      />
    </div>
  );
}
