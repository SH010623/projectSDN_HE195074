import Icon from "./ui/Icon";
import * as Select from "@radix-ui/react-select";

interface AppSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  fullWidth?: boolean;
}

export default function AppSelect({ label, value, onValueChange, options, required, fullWidth }: AppSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange} required={required}>
      <Select.Trigger aria-label={label} className={`flex h-11 min-w-0 items-center justify-between gap-3 rounded-lg border border-white/15 bg-[#0a0a12] px-3 py-2.5 text-left text-sm text-white outline-none transition-colors hover:border-white/30 focus-visible:ring-2 focus-visible:ring-rose-400 data-[state=open]:border-rose-400 ${fullWidth ? "w-full" : "w-48"}`}>
        <span className="truncate"><Select.Value placeholder="Chọn một mục" /></span>
        <Select.Icon className="shrink-0 text-gray-400"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={6} collisionPadding={12} className="z-[60] max-h-[var(--radix-select-content-available-height)] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-white/15 bg-[#1b1b29] p-1 text-white shadow-xl">
          <Select.ScrollUpButton className="py-1 text-center text-gray-400">↑</Select.ScrollUpButton>
          <Select.Viewport>
            {options.map(option => <Select.Item key={option.value} value={option.value} className="relative cursor-pointer rounded-md py-2.5 pl-3 pr-8 text-sm outline-none data-[highlighted]:bg-white/10 data-[state=checked]:text-rose-300">
              <Select.ItemText>{option.label}</Select.ItemText><Select.ItemIndicator className="absolute right-3"><Icon name="check" /></Select.ItemIndicator>
            </Select.Item>)}
          </Select.Viewport>
          <Select.ScrollDownButton className="py-1 text-center text-gray-400">↓</Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
