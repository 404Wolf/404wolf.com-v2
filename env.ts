import { envsafe, str } from "envsafe";

export const env = envsafe({
	FETCH_RESUME: str({
		default: "true",
		choices: ["true", "false"],
		allowEmpty: true,
	}),
});
