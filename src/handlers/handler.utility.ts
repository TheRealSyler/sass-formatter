import { SassFormattingOptions, SassTextLine } from '..';

import { FormattingState } from '../state';
import { isKeyframePoint } from '../utility';
import { isIfOrElse, isElse, isKeyframes as isKeyframes_ } from 'suf-regex';

export function FormatHandleSetTabs(
  options: SassFormattingOptions,
  State: FormattingState,
  headerStuff?: { offset: number; additionalTabs: number }
) {
  if (headerStuff === undefined) {
    // § set Tabs Property
    if (State.CONTEXT.keyframes.is && State.LOCAL_CONTEXT.isKeyframesPoint) {
      State.CONTEXT.tabs = Math.max(0, State.CONTEXT.keyframes.tabs + options.tabSize);
    }
    if (State.LOCAL_CONTEXT.isIfOrElseAProp && State.CONTEXT.keyframes.is) {
      State.CONTEXT.tabs = State.CONTEXT.keyframes.tabs + options.tabSize * 2;
    } else if (State.LOCAL_CONTEXT.isIfOrElseAProp && !State.CONTEXT.keyframes.is) {
      State.CONTEXT.tabs = State.CONTEXT.currentTabs;
    }
  } else {
    //§ set Tabs Header Block
    if (State.LOCAL_CONTEXT.isKeyframes) {
      State.CONTEXT.keyframes.tabs = Math.max(
        0,
        State.LOCAL_CONTEXT.indentation.distance + headerStuff.offset + options.tabSize
      );
    }
    if (State.LOCAL_CONTEXT.ResetTabs) {
      State.CONTEXT.tabs = Math.max(0, State.LOCAL_CONTEXT.indentation.distance + headerStuff.offset);
      State.CONTEXT.currentTabs = State.CONTEXT.tabs;
    } else {
      State.CONTEXT.tabs = Math.max(
        0,
        State.LOCAL_CONTEXT.indentation.distance + headerStuff.offset + options.tabSize + headerStuff.additionalTabs
      );

      State.CONTEXT.currentTabs = State.CONTEXT.tabs;
    }
  }
}

export function FormatHandleLocalContext(line: SassTextLine, options: SassFormattingOptions, State) {
  const isPointCheck = isKeyframePoint(line.text, State.CONTEXT.keyframes.is);
  if (State.CONTEXT.keyframes.is && isPointCheck) {
    State.CONTEXT.tabs = Math.max(0, State.CONTEXT.keyframes.tabs);
  }
  const isKeyframes = isKeyframes_(line.text);

  let IS_IF_OR_ELSE_ = isIfOrElse(line.text);
  let isIfOrElseAProp = false;
  if (State.CONTEXT.keyframes.is && IS_IF_OR_ELSE_) {
    IS_IF_OR_ELSE_ = false;
    isIfOrElseAProp = true;
    State.CONTEXT.tabs = State.CONTEXT.keyframes.tabs + options.tabSize;
  }
  if (IS_IF_OR_ELSE_ && !State.CONTEXT.keyframes.is && isElse(line.text)) {
    isIfOrElseAProp = true;
    IS_IF_OR_ELSE_ = false;
    State.CONTEXT.tabs = Math.max(0, State.CONTEXT.currentTabs - options.tabSize);
  }
  return {
    isIfOrElse: IS_IF_OR_ELSE_,
    isIfOrElseAProp,
    isKeyframes,
    isKeyframesPoint: isPointCheck
  };
}
