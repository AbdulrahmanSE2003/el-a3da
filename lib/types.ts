export type Pose = "leading" | "flexing" | "joking" | "resting"

export type AbuOmarState =
  | { type: "walking" }
  | { type: "pose"; pose: Pose; message: string }
  | { type: "exiting"; message: string }
  | { type: "waiting" }
