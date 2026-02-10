export function EdgeConditionsSection() {
  return (
    <div className="space-y-10">
      {/* Conditions table */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Edge Conditions
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Each edge has a <Code>when</Code> object. An edge matches if{" "}
          <em>all</em> specified conditions are met. Unspecified fields are
          ignored.
        </p>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">
                  Field
                </th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">
                  Matches when...
                </th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">
                  Example
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="px-4 py-3">
                  <Code>intent</Code>
                </td>
                <td className="px-4 py-3 text-gray-500">string</td>
                <td className="px-4 py-3 text-gray-400">
                  Agent&apos;s intent contains this substring
                </td>
                <td className="px-4 py-3">
                  <Code color="green">&quot;button styling&quot;</Code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <Code>hasData</Code>
                </td>
                <td className="px-4 py-3 text-gray-500">string[]</td>
                <td className="px-4 py-3 text-gray-400">
                  Payload has all listed keys
                </td>
                <td className="px-4 py-3">
                  <Code color="green">
                    [&quot;component&quot;, &quot;variant&quot;]
                  </Code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <Code>lacks</Code>
                </td>
                <td className="px-4 py-3 text-gray-500">string[]</td>
                <td className="px-4 py-3 text-gray-400">
                  Payload is missing all listed keys
                </td>
                <td className="px-4 py-3">
                  <Code color="green">[&quot;theme&quot;]</Code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <Code>match</Code>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  Record&lt;string, any&gt;
                </td>
                <td className="px-4 py-3 text-gray-400">
                  Payload values match exactly
                </td>
                <td className="px-4 py-3">
                  <Code color="green">
                    {`{ "type": "button" }`}
                  </Code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <Code>always</Code>
                </td>
                <td className="px-4 py-3 text-gray-500">boolean</td>
                <td className="px-4 py-3 text-gray-400">
                  Always matches (fallback edge)
                </td>
                <td className="px-4 py-3">
                  <Code color="green">true</Code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Transforms table */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Edge Transforms
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Optional <Code>transform</Code> reshapes the payload before it arrives
          at the destination hex. Applied in order: pick &rarr; omit &rarr;
          inject &rarr; rename.
        </p>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">
                  Field
                </th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">
                  Effect
                </th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">
                  Example
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="px-4 py-3">
                  <Code>pick</Code>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  Keep only these keys
                </td>
                <td className="px-4 py-3">
                  <Code color="green">
                    [&quot;component&quot;, &quot;variant&quot;]
                  </Code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <Code>omit</Code>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  Remove these keys
                </td>
                <td className="px-4 py-3">
                  <Code color="green">[&quot;debug&quot;]</Code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <Code>inject</Code>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  Merge in static values
                </td>
                <td className="px-4 py-3">
                  <Code color="green">
                    {`{ "source": "hive" }`}
                  </Code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <Code>rename</Code>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  Rename payload keys
                </td>
                <td className="px-4 py-3">
                  <Code color="green">
                    {`{ "comp": "component" }`}
                  </Code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Code({
  children,
  color = "blue",
}: {
  children: React.ReactNode;
  color?: "blue" | "green" | "purple";
}) {
  const colors = {
    blue: { bg: "rgba(59,130,246,0.1)", text: "#93c5fd" },
    green: { bg: "rgba(34,197,94,0.1)", text: "#86efac" },
    purple: { bg: "rgba(168,85,247,0.1)", text: "#d8b4fe" },
  };
  const c = colors[color];

  return (
    <code
      className="px-1.5 py-0.5 rounded text-xs font-mono"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {children}
    </code>
  );
}
