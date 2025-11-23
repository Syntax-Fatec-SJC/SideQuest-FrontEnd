interface CheckboxFiltroProps {
  label: string;
  checked: boolean;
  onChange: (valor: boolean) => void;
}

export function CheckboxFiltro({ label, checked, onChange }: CheckboxFiltroProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-azul-escuro focus:ring-azul-claro"
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}
