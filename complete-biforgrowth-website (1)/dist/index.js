// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  contacts;
  currentId;
  currentContactId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.contacts = /* @__PURE__ */ new Map();
    this.currentId = 1;
    this.currentContactId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Contact methods implementation
  async getContact(id) {
    return this.contacts.get(id);
  }
  async getAllContacts() {
    return Array.from(this.contacts.values());
  }
  async createContact(contactData) {
    const id = this.currentContactId++;
    const company = contactData.company ?? "";
    const companySize = contactData.companySize ?? "";
    const contact = {
      ...contactData,
      company,
      companySize,
      id
    };
    this.contacts.set(id, contact);
    return contact;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull().default(""),
  companySize: text("company_size").notNull().default(""),
  countryCode: text("country_code").notNull().default(""),
  telephone: text("telephone").notNull().default(""),
  service: text("service").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  email: true,
  company: true,
  companySize: true,
  countryCode: true,
  telephone: true,
  service: true,
  message: true
});

// server/routes.ts
import nodemailer from "nodemailer";
function formatContactToEmail(contact) {
  const serviceMap = {
    "all-services": "All Services",
    "business-process": "Business Process Creation",
    "data-automation": "Data Analysis Automation",
    "data-visualization": "Data Visualization",
    "business-reports": "Custom Business Reports",
    "market-reports": "Market & Competition Reports",
    "other": "Other Services"
  };
  let phone = "Not provided";
  if (contact.telephone && contact.countryCode) {
    const countryCode = contact.countryCode.split("_")[0] || "";
    phone = `${countryCode} ${contact.telephone}`;
  } else if (contact.telephone) {
    phone = contact.telephone;
  }
  return `
    <h1>New Contact Form Submission (#${contact.id})</h1>
    <p><strong>Name:</strong> ${contact.name}</p>
    <p><strong>Email:</strong> ${contact.email}</p>
    <p><strong>Company:</strong> ${contact.company || "Not provided"}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Service Interested In:</strong> ${serviceMap[contact.service] || contact.service}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space: pre-wrap;">${contact.message}</p>
    <hr>
    <p style="color: #666; font-size: 12px;">This message was sent from the BI for Growth website contact form.</p>
  `;
}
async function createEmailTransport() {
  try {
    const transporter = nodemailer.createTransport({
      // Using Ethereal for now (for testing)
      // Later you can replace with your WordPress host SMTP settings
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      // No SSL for test email
      auth: {
        // In real world, we'd use your WordPress host SMTP
        user: (await nodemailer.createTestAccount()).user,
        pass: (await nodemailer.createTestAccount()).pass
      }
    });
    console.log("Email transport created successfully");
    return transporter;
  } catch (error) {
    console.error("Failed to create email transport:", error);
    const testAccount = await nodemailer.createTestAccount();
    console.log("Using test account instead:", testAccount.user);
    console.log("Test account password:", testAccount.pass);
    console.log("View test emails at: https://ethereal.email");
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
}
async function registerRoutes(app2) {
  app2.get("/api/contacts", async (req, res) => {
    try {
      const contacts2 = await storage.getAllContacts();
      const sortedContacts = [...contacts2].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return res.status(200).json({
        contacts: sortedContacts.map((contact) => ({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          company: contact.company || "",
          service: contact.service,
          message: contact.message,
          createdAt: contact.createdAt
        })),
        total: contacts2.length
      });
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return res.status(500).json({
        message: "An error occurred while fetching contacts"
      });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const validationResult = insertContactSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid form data",
          errors: validationResult.error.errors
        });
      }
      const contactData = validationResult.data;
      const contact = await storage.createContact({
        ...contactData,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      console.log("New contact form submission:", {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        company: contact.company,
        service: contact.service,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      console.log("Contact message:", contact.message);
      try {
        const transport = await createEmailTransport();
        const htmlContent = formatContactToEmail(contact);
        const info = await transport.sendMail({
          from: '"BI for Growth Website" <noreply@biforgrowth.com>',
          to: "info@biforgrowth.com",
          subject: `New Contact Form: ${contact.name} about ${contact.service}`,
          html: htmlContent,
          text: `New contact from ${contact.name} (${contact.email}) about ${contact.service}. Message: ${contact.message}`
        });
        console.log("Email sent to info@biforgrowth.com");
        const testUrl = nodemailer.getTestMessageUrl(info);
        if (testUrl) {
          console.log("Email preview URL:", testUrl);
        }
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
      }
      return res.status(201).json({
        message: "Contact form submitted successfully",
        contact: {
          id: contact.id,
          name: contact.name,
          email: contact.email
        }
      });
    } catch (error) {
      console.error("Error handling contact form submission:", error);
      return res.status(500).json({
        message: "An error occurred while processing your request"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
