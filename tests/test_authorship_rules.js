/**
 * Testes Unitários: Regras de Autoria para Vídeos por Link
 */

import { validateVideoAuthorship, ALLOWED_CC_LICENSES, verifyCreativeCommonsLicense } from '../feed/authorship.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- TESTES: REGRAS DE AUTORIA PARA VÍDEOS POR LINK ---\n');

// 1. Obrigatório escolher autoria para vídeos
const testNoAuthorship = validateVideoAuthorship({
  format: 'curto',
  authorship: null
});
assert(!testNoAuthorship.valid, 'Deve bloquear publicação de vídeo sem escolha de autoria');
assert(testNoAuthorship.error.includes('Escolha obrigatoriamente'), 'Mensagem clara sobre obrigatoriedade de autoria');

// 2. Não vídeos (música, texto) não são afetados pela regra estrita de vídeo
const testMusic = validateVideoAuthorship({
  format: 'musica',
  authorship: null
});
assert(testMusic.valid, 'Formatos que não são vídeo são aceitos sem declaração de vídeo');

// 3. Creative Commons - Rejeição por licença não permitida ou inválida
const testInvalidLicense = validateVideoAuthorship({
  format: 'longo',
  authorship: 'creative_commons',
  license: 'CC BY-NC', // Não permitida
  author: 'Biólogo Pedro',
  sourceUrl: 'https://youtube.com/watch?v=123'
});
assert(!testInvalidLicense.valid, 'Deve rejeitar licença não permitida (ex: CC BY-NC)');

// 4. Creative Commons - Rejeição por falta de autor
const testNoAuthor = validateVideoAuthorship({
  format: 'curto',
  authorship: 'creative_commons',
  license: 'CC BY',
  author: '',
  sourceUrl: 'https://youtube.com/watch?v=123'
});
assert(!testNoAuthor.valid, 'Deve rejeitar Creative Commons sem nome de autor');

// 5. Creative Commons - Rejeição por falta de link da fonte
const testNoSource = validateVideoAuthorship({
  format: 'curto',
  authorship: 'creative_commons',
  license: 'CC BY-SA',
  author: 'Instituto Socioambiental',
  sourceUrl: 'invalido'
});
assert(!testNoSource.valid, 'Deve rejeitar Creative Commons com link de fonte inválido');

// 6. Creative Commons - Sucesso para CC BY, CC BY-SA e CC0
for (const lic of ['CC BY', 'CC BY-SA', 'CC0']) {
  const testCCValid = validateVideoAuthorship({
    format: 'longo',
    authorship: 'creative_commons',
    license: lic,
    author: 'Coletivo Povos da Floresta',
    sourceUrl: 'https://archive.org/details/exemplo'
  });
  assert(testCCValid.valid, `Deve aceitar licença permitida: ${lic}`);
  assert(testCCValid.data.licenca === lic, `Dados devem registrar licença correta (${lic})`);
  assert(testCCValid.data.statusAnalise === 'aprovado', 'Status de CC válida deve ser aprovado');
}

// 7. É meu vídeo - Canal NÃO coincidente com o perfil -> "em_analise" e sem destaque no feed
const testNotMatched = validateVideoAuthorship({
  format: 'curto',
  authorship: 'meu_video',
  channelIdentifier: 'youtube.com/@outro_canal_estranho',
  userProfile: {
    name: 'Mestre Tiago',
    linkedAccounts: ['youtube.com/@mestretíago', 'instagram.com/mestretíago']
  }
});
assert(testNotMatched.valid, 'Publicação é aceita mas marcada para moderação');
assert(testNotMatched.data.statusAnalise === 'em_analise', 'Deve marcar postagem como "em análise"');
assert(testNotMatched.data.destaqueFeed === false, 'NÃO deve destacar postagem não verificada nos feeds');
assert(testNotMatched.data.avisoAnalise.includes('em análise'), 'Deve emitir aviso de análise ética');

// 8. É meu vídeo - Canal coincidente com o perfil -> "aprovado" e com destaque no feed
const testMatched = validateVideoAuthorship({
  format: 'curto',
  authorship: 'meu_video',
  channelIdentifier: 'youtube.com/@mestretíago',
  userProfile: {
    name: 'Mestre Tiago',
    linkedAccounts: ['https://youtube.com/@mestretíago', 'https://instagram.com/mestretíago']
  }
});
assert(testMatched.valid, 'Publicação de autor verificado é aceita');
assert(testMatched.data.statusAnalise === 'aprovado', 'Autor verificado tem status "aprovado"');
assert(testMatched.data.destaqueFeed === true, 'Autor verificado tem destaque no feed garantido');

// 9. Verificação automática assíncrona preparada para a próxima fase
verifyCreativeCommonsLicense('https://youtube.com/watch?v=123', 'youtube').then(res => {
  assert(res.checked === true, 'Verificação automática assíncrona está funcional e preparada');
  assert(res.detectedLicense === 'CC BY', 'Detecta licença simulada sem expor credenciais');

  console.log(`\n========================================`);
  console.log(`RESULTADO AUTORIA: ${passed} passaram, ${failed} falharam.`);
  if (failed > 0) process.exit(1);
});

