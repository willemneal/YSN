import {
    context,
    PersistentMap,
    PersistentSet,
    PersistentUnorderedMap,
    u128,
} from 'near-sdk-as'
import { YSN_ADDRESS } from '../../accounts'
import { ROYALTY_PERCENTAGE } from './index'

type AccountId = string
type MediaId = string

const NFT_SPEC = 'nft-1.0.0'
const NFT_NAME = 'Share'
const NFT_SYMBOL = 'SHARE'

const ONE_NEAR = u128.from('1000000000000000000000000')

export const DESIGN_PRICE = ONE_NEAR

export const ROYALTY_MAX_PERCENTAGE: u32 = 5000 // 50%

export const FT_CONTRACT: string = YSN_ADDRESS
const ROYALTY_ADDRESS: string = YSN_ADDRESS // social token
@nearBindgen
export class NFTContractMetadata {
    spec: string = NFT_SPEC
    name: string = NFT_NAME
    symbol: string = NFT_SYMBOL
    icon: string
    base_uri: string
    reference: string
    reference_hash: string
}

@nearBindgen
class TokenMetadata {
    constructor(
        public title: string = '',
        public issued_at: string = '',
        public copies: u8 = 1,
        public extra: Uint8Array = new Uint8Array(0),
        public description: string = '',
        public media: string = '',
        public media_hash: string = '',
        public expires_at: string = '',
        public starts_at: string = '',
        public updated_at: string = '',
        public reference: string = '',
        public reference_hash: string = ''
    ) {}
}

@nearBindgen
export class Extra {
    constructor(public instructions: string = '') {}
}

@nearBindgen
export class Royalty {
    split_between: Map<AccountId, u32> = new Map()
    percentage: u32 = 0
    constructor() {
        /** 25% of future sales goes to FT */
        this.split_between.set(FT_CONTRACT, ROYALTY_PERCENTAGE)
        this.percentage = ROYALTY_PERCENTAGE
    }
}

@nearBindgen
export class Design {
    id: string
    owner_id: string
    creator: string
    prev_owner: string
    metadata: TokenMetadata
    royalty: Royalty
    constructor(instructions: string, seed: i32) {
        this.id = seed.toString()
        this.owner_id = context.sender
        this.prev_owner = context.sender
        this.creator = ROYALTY_ADDRESS

        this.royalty = new Royalty()

        // pass it to market to make sure that on mint royalties add up to 100%
        const royalty_percentage = this.royalty.percentage

        const title = context.sender.substring(
            0,
            context.sender.lastIndexOf('.')
        )
        const issued_at = context.blockTimestamp.toString()
        const copies: u8 = 1

        const extra = new Extra(instructions).encode()

        this.metadata = new TokenMetadata(title, issued_at, copies, extra)
    }
}

@nearBindgen
export class TemporaryDesign {
    constructor(public instructions: string, public seed: i32) {}
}

export const designs = new PersistentUnorderedMap<AccountId, Design>('dsgn')
export const owners = new PersistentSet<AccountId>('onrs')

export const account_media = new PersistentUnorderedMap<
    AccountId,
    PersistentSet<MediaId>
>('acmd')
