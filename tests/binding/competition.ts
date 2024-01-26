import * as ex from "@completium/experiment-ts";
import * as att from "@completium/archetype-ts-types";
export enum states {
    Created = 1,
    InProgress,
    Done,
    Closed
}
export const mich_to_state = (m: any): states => {
    const v = (new att.Nat((m as att.Mint).int)).to_big_number().toNumber();
    switch (v) {
        case 0: return states.Created;
        case 1: return states.InProgress;
        case 2: return states.Done;
        case 3: return states.Closed;
        default: throw new Error("mich_to_asset_type : invalid value " + v);
    }
};
export const submission_key_mich_type: att.MichelineType = att.prim_annot_to_mich_type("address", []);
export class submission_value implements att.ArchetypeType {
    constructor(public score: att.Nat, public timestamp: Date) { }
    toString(): string {
        return JSON.stringify(this, null, 2);
    }
    to_mich(): att.Micheline {
        return att.pair_to_mich([this.score.to_mich(), att.date_to_mich(this.timestamp)]);
    }
    equals(v: submission_value): boolean {
        return att.micheline_equals(this.to_mich(), v.to_mich());
    }
    static from_mich(input: att.Micheline): submission_value {
        return new submission_value(att.Nat.from_mich((input as att.Mpair).args[0]), att.mich_to_date((input as att.Mpair).args[1]));
    }
}
export const submission_value_mich_type: att.MichelineType = att.pair_array_to_mich_type([
    att.prim_annot_to_mich_type("nat", ["%score"]),
    att.prim_annot_to_mich_type("timestamp", ["%timestamp"])
], []);
export type submission_container = Array<[
    att.Address,
    submission_value
]>;
export const submission_container_mich_type: att.MichelineType = att.pair_annot_to_mich_type("map", att.prim_annot_to_mich_type("address", []), att.pair_array_to_mich_type([
    att.prim_annot_to_mich_type("nat", ["%score"]),
    att.prim_annot_to_mich_type("timestamp", ["%timestamp"])
], []), []);
const confirm_arg_to_mich = (): att.Micheline => {
    return att.unit_mich;
}
const submit_arg_to_mich = (packed_score: att.Bytes, signed_score: att.Signature): att.Micheline => {
    return att.pair_to_mich([
        packed_score.to_mich(),
        signed_score.to_mich()
    ]);
}
const decide_arg_to_mich = (): att.Micheline => {
    return att.unit_mich;
}
export class Competition {
    address: string | undefined;
    constructor(address: string | undefined = undefined) {
        this.address = address;
    }
    get_address(): att.Address {
        if (undefined != this.address) {
            return new att.Address(this.address);
        }
        throw new Error("Contract not initialised");
    }
    async get_balance(): Promise<att.Tez> {
        if (null != this.address) {
            return await ex.get_balance(new att.Address(this.address));
        }
        throw new Error("Contract not initialised");
    }
    async deploy(start: Date, params: Partial<ex.Parameters>) {
        const address = (await ex.deploy("./contracts/competition.arl", {
            start: att.date_to_mich(start)
        }, params)).address;
        this.address = address;
    }
    async confirm(params: Partial<ex.Parameters>): Promise<att.CallResult> {
        if (this.address != undefined) {
            return await ex.call(this.address, "confirm", confirm_arg_to_mich(), params);
        }
        throw new Error("Contract not initialised");
    }
    async submit(packed_score: att.Bytes, signed_score: att.Signature, params: Partial<ex.Parameters>): Promise<att.CallResult> {
        if (this.address != undefined) {
            return await ex.call(this.address, "submit", submit_arg_to_mich(packed_score, signed_score), params);
        }
        throw new Error("Contract not initialised");
    }
    async decide(params: Partial<ex.Parameters>): Promise<att.CallResult> {
        if (this.address != undefined) {
            return await ex.call(this.address, "decide", decide_arg_to_mich(), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_confirm_param(params: Partial<ex.Parameters>): Promise<att.CallParameter> {
        if (this.address != undefined) {
            return await ex.get_call_param(this.address, "confirm", confirm_arg_to_mich(), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_submit_param(packed_score: att.Bytes, signed_score: att.Signature, params: Partial<ex.Parameters>): Promise<att.CallParameter> {
        if (this.address != undefined) {
            return await ex.get_call_param(this.address, "submit", submit_arg_to_mich(packed_score, signed_score), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_decide_param(params: Partial<ex.Parameters>): Promise<att.CallParameter> {
        if (this.address != undefined) {
            return await ex.get_call_param(this.address, "decide", decide_arg_to_mich(), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_organizer(): Promise<att.Address> {
        if (this.address != undefined) {
            const storage = await ex.get_raw_storage(this.address);
            return att.Address.from_mich((storage as att.Mpair).args[0]);
        }
        throw new Error("Contract not initialised");
    }
    async get_prize(): Promise<att.Tez> {
        if (this.address != undefined) {
            const storage = await ex.get_raw_storage(this.address);
            return att.Tez.from_mich((storage as att.Mpair).args[1]);
        }
        throw new Error("Contract not initialised");
    }
    async get_submission(): Promise<submission_container> {
        if (this.address != undefined) {
            const storage = await ex.get_raw_storage(this.address);
            return att.mich_to_map((storage as att.Mpair).args[2], (x, y) => [att.Address.from_mich(x), submission_value.from_mich(y)]);
        }
        throw new Error("Contract not initialised");
    }
    async get_state(): Promise<states> {
        if (this.address != undefined) {
            const storage = await ex.get_raw_storage(this.address);
            const state = (storage as att.Mpair).args[3];
            switch (att.Int.from_mich(state).to_number()) {
                case 0: return states.Created;
                case 1: return states.InProgress;
                case 2: return states.Done;
                case 3: return states.Closed;
            }
        }
        return states.Created;
    }
    errors = {
        INVALID_STATE: att.string_to_mich("\"INVALID_STATE\""),
        OPTION_IS_NONE: att.string_to_mich("\"OPTION_IS_NONE\""),
        INVALID_CALLER: att.string_to_mich("\"INVALID_CALLER\""),
        NOT_SIGNED_BY_ORACLE: att.string_to_mich("\"not signed by oracle\""),
        CANNOT_UNPACK_SCORE: att.string_to_mich("\"cannot unpack score\""),
        BAD_CALLER: att.string_to_mich("\"bad caller\""),
        c1: att.pair_to_mich([att.string_to_mich("\"INVALID_CONDITION\""), att.string_to_mich("\"c1\"")])
    };
}
export const competition = new Competition();
