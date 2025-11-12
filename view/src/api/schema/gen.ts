(async () => {
  const { OpenApiGeneratorV31 } = await import(
    "@asteasolutions/zod-to-openapi"
  );
  const yaml = await import("yaml");
  // @ts-ignore - Node.js built-in modules
  const fs = await import("fs");
  // @ts-ignore - Node.js built-in modules
  const path = await import("path");
  // @ts-ignore - Node.js built-in modules
  const { fileURLToPath } = await import("url");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const { registry } = await import("./route.js");
  const generator = new OpenApiGeneratorV31(registry.definitions);
  const docs = generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "app-supportocol api",
      version: "1.0.0",
    },
  });

  const outputPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "internal",
    "api",
    "schema",
    "openapi.yml"
  );
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, yaml.stringify(docs), {
    encoding: "utf-8",
  });

  console.log(`OpenAPI specification generated at: ${outputPath}`);
})();
