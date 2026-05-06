import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

loadEnvConfig("..", undefined, console, true);

const nextConfig: NextConfig = {};

export default nextConfig;
