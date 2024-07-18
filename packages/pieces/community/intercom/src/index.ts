import { createCustomApiCallAction } from '@activepieces/pieces-common';
import {
  OAuth2PropertyValue,
  PieceAuth,
  createPiece,
  Property,
} from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { createContact } from './lib/actions/create-contact.action';
import { getOrCreateContact } from './lib/actions/create-or-get-contact.action';
import { sendMessage } from './lib/actions/send-message.action';
import crypto from 'node:crypto';
import { noteAddedToConversation } from './lib/triggers/note-added-to-conversation';
import { addNoteToConversation } from './lib/actions/add-note-to-conversation';
import { replyToConversation } from './lib/actions/reply-to-conversation';

export const intercomAuth = PieceAuth.OAuth2({
  authUrl: 'https://app.{region}.com/oauth',
  tokenUrl: 'https://api.{region}.io/auth/eagle/token',
  required: true,
  scope: [],
  props: {
    region: Property.StaticDropdown({
      displayName: 'Region',
      required: true,
      options: {
        options: [
          { label: 'US', value: 'intercom' },
          { label: 'EU', value: 'eu.intercom' },
          { label: 'AU', value: 'au.intercom' },
        ],
      },
    }),
  },
});

export const intercom = createPiece({
  displayName: 'Intercom',
  description: 'Customer messaging platform for sales, marketing, and support',
  minimumSupportedRelease: '0.29.0', // introduction of new intercom APP_WEBHOOK
  logoUrl: 'https://cdn.activepieces.com/pieces/intercom.png',
  categories: [PieceCategory.CUSTOMER_SUPPORT],
  auth: intercomAuth,
  triggers: [noteAddedToConversation],
  authors: [
    'kishanprmr',
    'MoShizzle',
    'AbdulTheActivePiecer',
    'khaledmashaly',
    'abuaboud',
    'AdamSelene',
  ],
  actions: [
    getOrCreateContact,
    createContact,
    sendMessage,
    addNoteToConversation,
    replyToConversation,
    createCustomApiCallAction({
      baseUrl: (auth) =>
        `https://api.${
          (auth as OAuth2PropertyValue).props?.['region']
        }.io`,
      auth: intercomAuth,
      authMapping: async (auth) => ({
        Authorization: `Bearer ${(auth as OAuth2PropertyValue).access_token}`,
      }),
    }),
  ],
  events: {
    parseAndReply: ({ payload }) => {
      const payloadBody = payload.body as PayloadBody;
      return {
        event: payloadBody.topic,
        identifierValue: payloadBody.app_id,
      };
    },
    verify: ({ payload, webhookSecret }) => {
      const signature = payload.headers['x-hub-signature'];
      const hmac = crypto.createHmac('sha1', webhookSecret);
      hmac.update(`${payload.rawBody}`);
      const computedSignature = `sha1=${hmac.digest('hex')}`;
      return signature === computedSignature;
    },
  },
});

type PayloadBody = {
  type: string;
  topic: string;
  id: string;
  app_id: string;
};
