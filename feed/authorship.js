/**
 * Regras de Autoria e Licenciamento Ético de Vídeos por Link
 * 
 * - Validação estrita de autoria: "É meu vídeo" ou "Vídeo de outra pessoa com licença Creative Commons"
 * - Licenças permitidas: apenas CC BY, CC BY-SA ou CC0
 * - Comparação de canal/embed com perfil do usuário
 * - Marcação "em_analise" se não coincidir com contas do perfil
 * - Botão de denúncia imediata: "Este vídeo é meu e não autorizei"
 * - Verificação automática de licença pronta para futura integração com backend (sem expor API keys)
 */

export const ALLOWED_CC_LICENSES = ['CC BY', 'CC BY-SA', 'CC0'];

/**
 * Valida a declaração de autoria e os dados de licença para vídeos por link
 */
export function validateVideoAuthorship({
  format,
  authorship,
  license,
  author,
  sourceUrl,
  channelIdentifier,
  userProfile = null
}) {
  const isVideo = format === 'curto' || format === 'longo' || format === 'videos';

  if (!isVideo) {
    return {
      valid: true,
      data: {
        autoria: 'livre',
        licenca: null,
        autor: null,
        fonte: null,
        statusAnalise: 'aprovado',
        destaqueFeed: true
      }
    };
  }

  // 1. Obrigatório escolher autoria
  if (!authorship || (authorship !== 'meu_video' && authorship !== 'creative_commons')) {
    return {
      valid: false,
      error: 'Escolha obrigatoriamente se o vídeo é de sua autoria ou de outra pessoa com licença Creative Commons.'
    };
  }

  // 2. Se for Creative Commons, exige tipo de licença (apenas CC BY, CC BY-SA ou CC0), autor e fonte
  if (authorship === 'creative_commons') {
    const formattedLic = (license || '').trim().toUpperCase();
    if (!formattedLic || !ALLOWED_CC_LICENSES.includes(formattedLic)) {
      return {
        valid: false,
        error: 'Selecione uma licença Creative Commons válida permitida (apenas CC BY, CC BY-SA ou CC0).'
      };
    }

    if (!author || author.trim().length < 2) {
      return {
        valid: false,
        error: 'Informe o nome ou canal do autor original do vídeo.'
      };
    }

    if (!sourceUrl || (!sourceUrl.startsWith('http://') && !sourceUrl.startsWith('https://'))) {
      return {
        valid: false,
        error: 'Informe o link da fonte original onde a licença Creative Commons é indicada.'
      };
    }

    return {
      valid: true,
      data: {
        autoria: 'creative_commons',
        licenca: formattedLic,
        autor: author.trim(),
        fonte: sourceUrl.trim(),
        statusAnalise: 'aprovado',
        destaqueFeed: true
      }
    };
  }

  // 3. Se for "É meu vídeo", compara dados do canal com links informados no perfil
  if (authorship === 'meu_video') {
    const profileAccounts = (userProfile && Array.isArray(userProfile.linkedAccounts))
      ? userProfile.linkedAccounts
      : [];
    
    const isChannelMatched = Boolean(
      channelIdentifier && profileAccounts.some(acc => {
        const cleanAcc = acc.toLowerCase().replace(/https?:\/\//, '').replace(/www\./, '').replace(/\/$/, '');
        const cleanChan = channelIdentifier.toLowerCase().replace(/https?:\/\//, '').replace(/www\./, '').replace(/\/$/, '');
        return cleanAcc.includes(cleanChan) || cleanChan.includes(cleanAcc);
      })
    );

    if (isChannelMatched) {
      return {
        valid: true,
        data: {
          autoria: 'meu_video',
          licenca: 'Autoral',
          autor: (userProfile && userProfile.name) || 'Autor Verificado',
          fonte: null,
          statusAnalise: 'aprovado',
          destaqueFeed: true
        }
      };
    } else {
      // Não coincidiu com as contas informadas no perfil: marca como "em análise" e sem destaque no feed
      return {
        valid: true,
        data: {
          autoria: 'meu_video',
          licenca: 'Autoral (Pendente de Validação de Canal)',
          autor: (userProfile && userProfile.name) || 'Criador',
          fonte: null,
          statusAnalise: 'em_analise',
          destaqueFeed: false,
          avisoAnalise: 'Como o canal do vídeo ainda não coincide com as contas confirmadas no seu perfil, a postagem foi marcada como "em análise" e não receberá destaque nos feeds até verificação da moderação.'
        }
      };
    }
  }

  return { valid: true };
}

/**
 * Verificação automática de licença preparada para a próxima fase.
 * Projetada para consumir endpoint ou oEmbed seguro sem expor tokens ou chaves de API no navegador.
 */
export async function verifyCreativeCommonsLicense(url, platform) {
  // Mock pronto e seguro para simulação local
  return {
    checked: true,
    verified: true,
    detectedLicense: 'CC BY',
    url,
    platform,
    checkedAt: new Date().toISOString()
  };
}

