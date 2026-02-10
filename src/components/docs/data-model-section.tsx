/**
 * Hand-colored code blocks showing Hex and Edge schemas.
 * Side-by-side at md:, stacked on mobile.
 */
export function DataModelSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Hex schema */}
      <div className="rounded-lg border border-white/10 bg-[#0f1015] overflow-hidden">
        <div className="px-4 py-2 border-b border-white/10 bg-white/[0.02]">
          <span className="text-xs font-mono text-gray-500">Hex</span>
        </div>
        <pre className="p-4 text-xs leading-relaxed overflow-x-auto font-mono">
          <Line>
            <Keyword>interface</Keyword> <Type>Hex</Type> {"{"}
          </Line>
          <Line>
            {"  "}
            <Prop>id</Prop>: <Type>string</Type>
            {"        "}
            <Comment>// kebab-case identifier</Comment>
          </Line>
          <Line>
            {"  "}
            <Prop>name</Prop>: <Type>string</Type>
            {"      "}
            <Comment>// human-readable label</Comment>
          </Line>
          <Line>
            {"  "}
            <Prop>type</Prop>: <Type>HexType</Type>
            {"    "}
            <Comment>// data | tool | gateway | junction</Comment>
          </Line>
          <Line>
            {"  "}
            <Prop>description</Prop>?: <Type>string</Type>
          </Line>
          <Line>
            {"  "}
            <Prop>contents</Prop>: {"{"}
          </Line>
          <Line>
            {"    "}
            <Prop>data</Prop>?: <Type>unknown</Type>
            {"  "}
            <Comment>// arbitrary payload</Comment>
          </Line>
          <Line>
            {"    "}
            <Prop>refs</Prop>?: <Type>string[]</Type>
            <Comment>// linked hex IDs</Comment>
          </Line>
          <Line>
            {"    "}
            <Prop>tools</Prop>?: <Type>ToolDef[]</Type>
          </Line>
          <Line>{"  }"}</Line>
          <Line>
            {"  "}
            <Prop>entryHints</Prop>: <Type>string[]</Type>
            <Comment>// semantic triggers</Comment>
          </Line>
          <Line>
            {"  "}
            <Prop>edges</Prop>: <Type>Edge[]</Type>
            {"    "}
            <Comment>// outbound connections</Comment>
          </Line>
          <Line>
            {"  "}
            <Prop>tags</Prop>: <Type>string[]</Type>
            {"   "}
            <Comment>// categorization</Comment>
          </Line>
          <Line>{"}"}</Line>
        </pre>
      </div>

      {/* Edge schema */}
      <div className="rounded-lg border border-white/10 bg-[#0f1015] overflow-hidden">
        <div className="px-4 py-2 border-b border-white/10 bg-white/[0.02]">
          <span className="text-xs font-mono text-gray-500">Edge</span>
        </div>
        <pre className="p-4 text-xs leading-relaxed overflow-x-auto font-mono">
          <Line>
            <Keyword>interface</Keyword> <Type>Edge</Type> {"{"}
          </Line>
          <Line>
            {"  "}
            <Prop>id</Prop>: <Type>string</Type>
            {"          "}
            <Comment>// unique within hex</Comment>
          </Line>
          <Line>
            {"  "}
            <Prop>to</Prop>: <Type>string</Type>
            {"          "}
            <Comment>// destination hex ID</Comment>
          </Line>
          <Line>
            {"  "}
            <Prop>description</Prop>: <Type>string</Type>
          </Line>
          <Line>
            {"  "}
            <Prop>priority</Prop>: <Type>number</Type>
            {"     "}
            <Comment>// 0-100, higher = preferred</Comment>
          </Line>
          <Line>
            {"  "}
            <Prop>when</Prop>: {"{"}
            {"             "}
            <Comment>// match conditions</Comment>
          </Line>
          <Line>
            {"    "}
            <Prop>intent</Prop>?: <Type>string</Type>
          </Line>
          <Line>
            {"    "}
            <Prop>hasData</Prop>?: <Type>string[]</Type>
          </Line>
          <Line>
            {"    "}
            <Prop>lacks</Prop>?: <Type>string[]</Type>
          </Line>
          <Line>
            {"    "}
            <Prop>match</Prop>?: <Type>Record</Type>
          </Line>
          <Line>
            {"    "}
            <Prop>always</Prop>?: <Type>boolean</Type>
          </Line>
          <Line>{"  }"}</Line>
          <Line>
            {"  "}
            <Prop>transform</Prop>?: {"{"}
            {"       "}
            <Comment>// reshape payload</Comment>
          </Line>
          <Line>
            {"    "}
            <Prop>pick</Prop>?: <Type>string[]</Type>
          </Line>
          <Line>
            {"    "}
            <Prop>omit</Prop>?: <Type>string[]</Type>
          </Line>
          <Line>
            {"    "}
            <Prop>inject</Prop>?: <Type>Record</Type>
          </Line>
          <Line>
            {"    "}
            <Prop>rename</Prop>?: <Type>Record</Type>
          </Line>
          <Line>{"  }"}</Line>
          <Line>{"}"}</Line>
        </pre>
      </div>
    </div>
  );
}

function Line({ children }: { children: React.ReactNode }) {
  return (
    <span className="block">
      {children}
    </span>
  );
}

function Keyword({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#c084fc" }}>{children}</span>;
}

function Type({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#60a5fa" }}>{children}</span>;
}

function Prop({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#e5e7eb" }}>{children}</span>;
}

function Comment({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#4b5563" }}>{children}</span>;
}
