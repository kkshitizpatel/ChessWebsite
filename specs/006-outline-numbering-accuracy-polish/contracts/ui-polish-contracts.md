# UI & Typography Contracts: Move List & Accuracy Panel Polish

## 1. Move List Move Number Badge Contract (`4.2`)

| Level | Example Moves | Move Badge Format | Example Badge Output |
|---|---|---|---|
| Main Line (`depth = 0`) | `1. e4 e5`, `2. Nf3 Nc6` | Integer string `${moveNumber}` | `1`, `2`, `3` |
| Primary Variation (`depth = 1`) | `1... c5`, `2. Nf3 d6` | Dotted outline `${branchPrefix}.${step}` | `1.1`, `1.2`, `1.3` |
| Nested Sub-Variation (`depth = 2`) | `2... e6` inside `1.1` | Dotted outline `${subPrefix}.${step}` | `1.1.1`, `1.1.2` |

## 2. Accuracy Panel Header Typography Contract (`4.6`)

| Element | Previous Styling | Updated Styling | Visual Effect |
|---|---|---|---|
| White Player Name | `truncate text-[11px]` | `whitespace-normal break-words leading-tight text-center max-w-[110px] text-[11px] font-bold text-gray-100` | Full name wraps to 2 lines without ellipsis |
| Black Player Name | `truncate text-[11px]` | `whitespace-normal break-words leading-tight text-center max-w-[110px] text-[11px] font-bold text-gray-300` | Full name wraps to 2 lines without ellipsis |
| Header Container | `h-[34px]` | `min-h-[40px] py-1 border-b border-[#2b2926] bg-[#161513] flex items-center px-3` | Accommodates 2-line wrapped player names |

## 3. Breakdown Row Metrics Sizing Contract (`4.6`)

| Metric Element | Previous Value | Updated Value |
|---|---|---|
| White / Black Count Font Size | `text-[12px]` | `text-[15px] font-bold font-mono` |
| Classification Circular Badge | `w-[16px] h-[16px]` (`size="sm"`) | `w-[22px] h-[22px] text-[11px]` (`size="lg"`) |
| Breakdown Row Height | `h-[24px]` | `min-h-[26px] py-0.5` |
| Accuracy Report Panel Total Height | `h-[320px]` | `h-[340px]` |
