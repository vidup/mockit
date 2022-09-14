import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [{
        input: "src/index.ts",
        output: {
            dir: "dist",
            format: "cjs",
        },
        plugins: [typescript()],
    },
    {
        // path to your declaration files root
        input: "./dist/dts/index.d.ts",
        output: [{ file: "dist/index.d.ts", format: "es" }],
        plugins: [dts()],
    },
];