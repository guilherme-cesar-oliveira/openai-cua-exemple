import OpenAI from "openai";
import { chromium } from 'playwright';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const display_width = process.env.display_width;
const display_height = process.env.display_height;
const initial_url = process.env.initial_url;
const new_tab_url = process.env.new_tab_url;
const initial_text = process.env.initial_text;

// Criar interface readline para entrada do usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Input messages
const input_messages = [
    {
        role: "user",
        content: initial_text
    }
];

// Tools
const tools = [{
    type: "computer_use_preview",
    display_width: display_width,
    display_height: display_height,
    environment: "browser",
}];


// Função para capturar screenshot
async function getScreenshot(page) {
    return await page.screenshot();
}

// Função para lidar com ações do modelo
async function handleModelAction(browser, page, action) {
    const actionType = action.type;

    try {
        // Verificar se temos uma nova página/aba e mudar para ela
        const allPages = browser.contexts()[0].pages();
        if (allPages.length > 1 && allPages[allPages.length - 1] !== page) {
            page = allPages[allPages.length - 1];
            console.log("Mudou para nova página/aba");
        }

        switch (actionType) {
            case "click":
                if (action.x !== undefined && action.y !== undefined) {
                    console.log(`Clicando em (${action.x}, ${action.y})`);
                    await page.mouse.click(action.x, action.y);
                }
                break;

            case "scroll":
                if (action.x !== undefined && action.y !== undefined && 
                    action.scroll_x !== undefined && action.scroll_y !== undefined) {
                    console.log(`Rolando em (${action.x}, ${action.y}) com offsets (${action.scroll_x}, ${action.scroll_y})`);
                    await page.mouse.move(action.x, action.y);
                    await page.evaluate(`window.scrollBy(${action.scroll_x}, ${action.scroll_y})`);
                }
                break;

            case "keypress":
                if (action.keys && Array.isArray(action.keys)) {
                    // Mapeamento de teclas comuns para o formato do Playwright
                    const keyMap = {
                        'ENTER': 'Enter',
                        'SPACE': ' ',
                        'BACKSPACE': 'Backspace',
                        'DELETE': 'Delete',
                        'TAB': 'Tab',
                        'ESCAPE': 'Escape',
                        'ARROWUP': 'ArrowUp',
                        'ARROWDOWN': 'ArrowDown',
                        'ARROWLEFT': 'ArrowLeft',
                        'ARROWRIGHT': 'ArrowRight',
                        'ALT': 'Alt',
                        'CTRL': 'Control',
                        'SHIFT': 'Shift',
                        'META': 'Meta',
                        'CAPSLOCK': 'CapsLock',
                        'HOME': 'Home',
                        'END': 'End',
                        'PAGEUP': 'PageUp', 
                        'PAGEDOWN': 'PageDown',
                        'INSERT': 'Insert',
                        'F1': 'F1',
                        'F2': 'F2',
                        'F3': 'F3',
                        'F4': 'F4',
                        'F5': 'F5',
                        'F6': 'F6',
                        'F7': 'F7',
                        'F8': 'F8',
                        'F9': 'F9',
                        'F10': 'F10',
                        'F11': 'F11',
                        'F12': 'F12',
                        'A': 'a',
                        'B': 'b',
                        'C': 'c',
                        'D': 'd',
                        'E': 'e',
                        'F': 'f',
                        'G': 'g',
                        'H': 'h',
                        'I': 'i',
                        'J': 'j',
                        'K': 'k',
                        'L': 'l',
                        'M': 'm',
                        'N': 'n',
                        'O': 'o',
                        'P': 'p',
                        'Q': 'q',
                        'R': 'r',
                        'S': 's',
                        'T': 't',
                        'U': 'u',
                        'V': 'v',
                        'W': 'w',
                        'X': 'x',
                        'Y': 'y',
                        'Z': 'z',
                        '0': '0',
                        '1': '1',
                        '2': '2',
                        '3': '3',
                        '4': '4',
                        '5': '5',
                        '6': '6',
                        '7': '7',
                        '8': '8',
                        '9': '9'
                    };

                    // Identificar teclas modificadoras (CTRL, ALT, SHIFT)
                    const modifiers = action.keys.filter(key => 
                        ['CTRL', 'ALT', 'SHIFT'].includes(key.toUpperCase())
                    );

                    // Identificar teclas não modificadoras
                    const regularKeys = action.keys.filter(key => 
                        !['CTRL', 'ALT', 'SHIFT'].includes(key.toUpperCase())
                    );

                    // Se houver combinação de teclas
                    if (modifiers.length > 0 && regularKeys.length > 0) {
                        console.log(`Pressionando combinação de teclas: ${action.keys.join('+')}`);
                        
                        // Verificar se é um comando especial do navegador
                        const isBrowserCommand = modifiers.includes('CTRL') && 
                            (regularKeys.includes('T') || regularKeys.includes('N') || 
                             regularKeys.includes('W') || regularKeys.includes('R'));
                        
                        if (isBrowserCommand) {
                            const context = browser.contexts()[0];
                            
                            // Mapeamento de comandos do navegador para funções do Playwright
                            if (modifiers.includes('CTRL')) {
                                if (regularKeys.includes('T')) {
                                    // Nova aba usando função nativa do Playwright
                                    const newPage = await context.newPage();
                                    await newPage.setViewportSize({ width: display_width, height: display_height });
                                    await newPage.goto(new_tab_url);
                                    page = newPage;
                                    console.log("Nova aba criada e navegando para o Google");
                                } else if (regularKeys.includes('N')) {
                                    // Nova janela usando função nativa do Playwright
                                    const newContext = await browser.newContext();
                                    const newPage = await newContext.newPage();
                                    await newPage.setViewportSize({ width: display_width, height: display_height });
                                    await newPage.goto(new_tab_url);
                                    page = newPage;
                                    console.log("Nova janela criada e navegando para o Google");
                                } else if (regularKeys.includes('W')) {
                                    // Fechar aba atual
                                    await page.close();
                                    const pages = context.pages();
                                    if (pages.length > 0) {
                                        page = pages[0];
                                        console.log("Aba fechada, mudando para aba anterior");
                                    }
                                } else if (regularKeys.includes('R')) {
                                    // Recarregar página
                                    await page.reload();
                                    console.log("Página recarregada");
                                } else if (regularKeys.includes('L')) {
                                    // Focar na barra de endereço
                                    await page.keyboard.press('F6');
                                    console.log("Barra de endereço focada");
                                } else if (regularKeys.includes('H')) {
                                    // Abrir histórico
                                    await page.goto('chrome://history/');
                                    console.log("Histórico aberto");
                                } else if (regularKeys.includes('J')) {
                                    // Abrir downloads
                                    await page.goto('chrome://downloads/');
                                    console.log("Downloads aberto");
                                } else if (regularKeys.includes('P')) {
                                    // Abrir página de impressão
                                    await page.keyboard.press('Control+P');
                                    console.log("Diálogo de impressão aberto");
                                }
                            } else if (modifiers.includes('ALT')) {
                                if (regularKeys.includes('LEFT')) {
                                    // Voltar
                                    await page.goBack();
                                    console.log("Navegando para página anterior");
                                } else if (regularKeys.includes('RIGHT')) {
                                    // Avançar
                                    await page.goForward();
                                    console.log("Navegando para próxima página");
                                } else if (regularKeys.includes('HOME')) {
                                    // Página inicial
                                    await page.goto('chrome://newtab/');
                                    console.log("Nova aba aberta");
                                }
                            } else if (modifiers.includes('SHIFT') && regularKeys.includes('DELETE')) {
                                // Limpar dados de navegação
                                await context.clearCookies();
                                await context.clearPermissions();
                                console.log("Dados de navegação limpos");
                            }
                        } else {
                            // Para comandos normais da página
                            const keyCombination = modifiers.map(m => keyMap[m.toUpperCase()]).join('+') + '+' + 
                                                 regularKeys.map(k => keyMap[k.toUpperCase()] || k).join('+');
                            await page.keyboard.press(keyCombination);
                        }
                    } else {
                        // Comportamento normal para teclas individuais
                        for (const key of action.keys) {
                            console.log(`Pressionando tecla: ${key}`);
                            const mappedKey = keyMap[key.toUpperCase()] || key;
                            await page.keyboard.press(mappedKey);
                        }
                    }
                }
                break;

            case "type":
                if (action.text) {
                    console.log(`Digitando texto: ${action.text}`);
                    await page.keyboard.type(action.text);
                }
                break;

            case "wait":
                console.log("Aguardando...");
                await new Promise(resolve => setTimeout(resolve, 2000));
                break;

            default:
                if(action.type === "computer_call_output") {
                    console.log(`Ação não reconhecida: ${JSON.stringify(action)}`);
                }
        }

        return page;

    } catch (error) {
        console.error(`Erro ao lidar com ação ${actionType}:`, error);
        return page;
    }
}

// Loop principal de uso do computador
async function computerUseLoop(browser, page, response) {
    while (true) {

        // Verifica se há apenas um item do tipo reasoning no output
        while (response.output.length === 1 && response.output[0].type === "reasoning") {
            console.log("Aguardando processamento do raciocínio...");
            
            // Busca atualização usando o ID da resposta anterior
            response = await openai.responses.create({
                model: "computer-use-preview",
                previous_response_id: response.id,
                tools: tools,
                input: [], // Input vazio para apenas acompanhar o status
                truncation: "auto"
            });

            await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda 1 segundo entre as verificações
        }

        const computerCalls = response.output.filter(item => item.type === "computer_call");

        let computerCall, lastCallId, action;

        if (computerCalls.length === 0) {

            for (const item of response.output) {
                if (item.content) {
                    console.log(item.content[0].text);
                    
                    // Aguarda input do usuário
                    const userInput = await new Promise(resolve => {
                        rl.question('Digite sua resposta: ', (answer) => {
                            resolve(answer);
                        });
                    });

                    // Envia resposta do usuário para o modelo
                    response = await openai.responses.create({
                        model: "computer-use-preview",
                        previous_response_id: response.id,
                        tools: tools,
                        input: [{
                            role: "user",
                            content: userInput,
                        }],
                        truncation: "auto"
                    });

                    // Continua o loop se houver novas ações
                    const newComputerCalls = response.output.filter(item => item.type === "computer_call");
                    if (newComputerCalls.length > 0) {
                        computerCall = newComputerCalls[0];
                        lastCallId = newComputerCalls.call_id;
                        action = newComputerCalls.action;
                    } else {
                        break;
                    }
                }
            }
        }

        computerCall = computerCall || computerCalls[0];
        if(computerCall){
            console.log("Processando ação do modelo...");
        lastCallId = lastCallId || computerCall.call_id;
        action = action || computerCall.action;
        }else{
          console.log(response.output_text)
          return;
        }

        page = await handleModelAction(browser, page, action);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const screenshotBytes = await getScreenshot(page);
        const screenshotBase64 = screenshotBytes.toString('base64');

        response = await openai.responses.create({
            model: "computer-use-preview",
            previous_response_id: response.id,
            tools: tools,
            input: [{
                call_id: lastCallId,
                type: "computer_call_output",
                output: {
                    type: "input_image",
                    image_url: `data:image/png;base64,${screenshotBase64}`
                }
            }],
            truncation: "auto"
        });

        if(response.status == 400){
            console.log(`Ação do modelo foi bloqueada por questões de segurança: ${response.error.message}`);
            return
        }
    }
}

// Função principal
async function main() {
    let browser;
    try {
        browser = await chromium.launch({
            headless: false,
            args: [
                "--disable-extensions",
                "--disable-file-system"
            ]
        });

        const context = await browser.newContext();
        const page = await context.newPage();
        await page.setViewportSize({ width: display_width, height: display_height });

        // Navegar para a URL inicial
        await page.goto(initial_url, { waitUntil: 'domcontentloaded' });

        // Criar resposta inicial
        const response = await openai.responses.create({
            model: "computer-use-preview",
            input: input_messages,
            tools: tools,
            reasoning: {
                generate_summary: "concise",
            },
            truncation: "auto"
        });

        console.log('Iniciando CUA.');
        await computerUseLoop(browser, page, response);
        console.log("CUA finalizado.");

    } catch (error) {
        console.error('Erro durante a execução:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
        rl.close();
    }
}

// Executar o programa
main().catch(console.error);