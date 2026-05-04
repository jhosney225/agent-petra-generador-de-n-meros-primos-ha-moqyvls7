const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();
const conversationHistory = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function chat(userMessage) {
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8096,
    system: `Eres Petra, un especialista en agricultura, comercio y matemáticas con habilidad perfecta (10.0) en todas ellas.
Tu rol es ayudar a generar y explicar algoritmos para encontrar números primos hasta un número N.
Puedes sugerir diferentes enfoques (Criba de Eratóstenes, verificación simple, etc.) y explicar sus ventajas.
También puedes ayudar a optimizar el código o explicar conceptos matemáticos relacionados con los números primos.`,
    messages: conversationHistory,
  });

  const assistantMessage =
    response.content[0].type === "text" ? response.content[0].text : "";

  conversationHistory.push({
    role: "assistant",
    content: assistantMessage,
  });

  return assistantMessage;
}

function generatePrimesSimple(n) {
  const primes = [];
  for (let num = 2; num <= n; num++) {
    let isPrime = true;
    for (let i = 2; i * i <= num; i++) {
      if (num % i === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      primes.push(num);
    }
  }
  return primes;
}

function generatePrimesEratosthenes(n) {
  if (n < 2) return [];

  const sieve = new Array(n + 1).fill(true);
  sieve[0] = false;
  sieve[1] = false;

  for (let i = 2; i * i <= n; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= n; j += i) {
        sieve[j] = false;
      }
    }
  }

  const primes = [];
  for (let i = 2; i <= n; i++) {
    if (sieve[i]) {
      primes.push(i);
    }
  }
  return primes;
}

async function main() {
  console.log("=================================");
  console.log("Generador de Números Primos");
  console.log("Asistente: Petra (Gen 4)");
  console.log("=================================\n");

  let N = 30;
  console.log(`Generando números primos hasta ${N}...\n`);

  const primesSimple = generatePrimesSimple(N);
  console.log(`Método simple: ${primesSimple.join(", ")}`);

  const primesEratosthenes = generatePrimesEratosthenes(N);
  console.log(`Criba de Eratóstenes: ${primesEratosthenes.join(", ")}`);
  console.log();

  console.log("Iniciando conversación con Petra sobre optimización...\n");

  let continueConversation = true;

  while (continueConversation) {
    const userInput = await question("Tú: ");

    if (
      userInput.toLowerCase() === "salir" ||
      userInput.toLowerCase() === "exit"
    ) {
      console.log("Gracias por usar el Generador de Números Primos. ¡Adiós!");
      continueConversation = false;
      break;
    }

    if (userInput.trim() === "") {
      continue;
    }

    try {
      const response = await chat(userInput);
      console.log(`\nPetra: ${response}\n`);
    } catch (error) {
      console.error("Error al procesar la solicitud:", error.message);
    }
  }

  rl.close();
}

main();