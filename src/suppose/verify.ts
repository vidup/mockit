import { FunctionSpy } from "../internal/functionSpy";
import { SuppositionRegistry } from ".";

export function verify(mock: any) {
  const suppositions = Reflect.get(
    mock,
    "suppositionsMap"
  ) as SuppositionRegistry;

  const spy = new FunctionSpy(mock);

  const defaultNever = suppositions
    .getSuppositions()
    .find((s) => s.count === "NEVER" && s.args == null);

  // This means it should never be called PERIOD, not matter which suppositions you added.
  if (defaultNever != null) {
    if (spy.hasBeenCalled.atLeastOnce) {
      throw new Error("Verification failed");
    }
  }

  const analysis = suppositions.getSuppositions().map((supposition) => {
    if (supposition.count === "NEVER") {
      if (supposition.args == null) {
        return !spy.hasBeenCalled.atLeastOnce;
      }

      return !spy.hasBeenCalled.withArgs(...supposition.args).atLeastOnce;
    }

    if (supposition.count === "atLeastOnce") {
      if (supposition.args == null) {
        return spy.hasBeenCalled.atLeastOnce;
      }

      return spy.hasBeenCalled.withArgs(...supposition.args).atLeastOnce;
    }

    if (supposition.args == null) {
      return spy.hasBeenCalled.nTimes(supposition.count);
    }

    return spy.hasBeenCalled
      .withArgs(...supposition.args)
      .nTimes(supposition.count);
  });

  if (analysis.some((a) => a === false)) {
    throw new Error("Verification failed");
  }

  // TODO: beautiful error message with lots of details
  // TODO: safeVerify that does not throw but instead returns the analysis with details
}
