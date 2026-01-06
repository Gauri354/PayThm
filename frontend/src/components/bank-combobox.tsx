"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const BANKS = [
    "Bank of Maharashtra",
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Bank of India",
    "Union Bank of India",
    "Central Bank of India",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank",
    "IndusInd Bank",
    "IDBI Bank",
    "Saraswat Cooperative Bank",
    "Cosmos Cooperative Bank",
    "SVC Co-operative Bank",
    "TJSB Sahakari Bank",
    "NKGSB Cooperative Bank",
    "Dombivli Nagari Sahakari Bank",
    "Abhyudaya Co-operative Bank",
    "IDFC First Bank",
    "Yes Bank",
    "Federal Bank"
]

interface BankComboboxProps {
    value: string
    onChange: (value: string) => void
}

export function BankCombobox({ value, onChange }: BankComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    // Filter banks
    const filteredBanks = BANKS.filter((bank) =>
        bank.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-foreground font-normal"
                >
                    {value
                        ? BANKS.find((bank) => bank === value) || value
                        : "Select bank..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Search bank..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1">
                    {filteredBanks.length === 0 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">No bank found.</div>
                    )}
                    {filteredBanks.map((bank) => (
                        <div
                            key={bank}
                            className={cn(
                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                value === bank ? "bg-zinc-100 dark:bg-zinc-800" : ""
                            )}
                            onClick={() => {
                                onChange(bank === value ? "" : bank)
                                setOpen(false)
                            }}
                        >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    value === bank ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {bank}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
