import { SassTextLine } from '../sassTextLine';

import { FormattingState } from '../state';
import { isKeyframePoint } from '../utility';
import { isIfOrElse, isElse, isKeyframes as isKeyframes_ } from 'suf-regex';

export function FormatSetTabs(
  STATE: FormattingState,
  headerStuff?: { offset: number; additionalTabs: number }
) {
  if (headerStuff === undefined) {
    // § set Tabs Property
    if (STATE.CONTEXT.keyframes.is && STATE.LOCAL_CONTEXT.isAtKeyframesPoint) {
      STATE.CONTEXT.tabs = Math.max(0, STATE.CONTEXT.keyframes.tabs + STATE.CONFIG.tabSize);
    }
    if (STATE.LOCAL_CONTEXT.isIfOrElseAProp && STATE.CONTEXT.keyframes.is) {
      STATE.CONTEXT.tabs = STATE.CONTEXT.keyframes.tabs + STATE.CONFIG.tabSize * 2;
    } else if (STATE.LOCAL_CONTEXT.isIfOrElseAProp && !STATE.CONTEXT.keyframes.is) {
      STATE.CONTEXT.tabs = STATE.CONTEXT.currentTabs;
    }
  } else {
    //§ set Tabs Header Block
    if (STATE.LOCAL_CONTEXT.isAtKeyframes) {
      STATE.CONTEXT.keyframes.tabs = Math.max(
        0,
        STATE.LOCAL_CONTEXT.indentation.distance + headerStuff.offset + STATE.CONFIG.tabSize
      );
    }
    if (STATE.LOCAL_CONTEXT.ResetTabs) {
      STATE.CONTEXT.tabs = Math.max(
        0,
        STATE.LOCAL_CONTEXT.indentation.distance + headerStuff.offset
      );
      STATE.CONTEXT.currentTabs = STATE.CONTEXT.tabs;
    } else {
      STATE.CONTEXT.tabs = Math.max(
        0,
        STATE.LOCAL_CONTEXT.indentation.distance +
        headerStuff.offset + // keep in mind that +offset can decrease the number.
        STATE.CONFIG.tabSize +
        headerStuff.additionalTabs
      );

      STATE.CONTEXT.currentTabs = STATE.CONTEXT.tabs;
    }
  }
}

export function isAtKeyframes(line: SassTextLine, STATE: FormattingState) {
  const isPointCheck = isKeyframePoint(line.get(), STATE.CONTEXT.keyframes.is);
  if (STATE.CONTEXT.keyframes.is && isPointCheck) {
    STATE.CONTEXT.tabs = Math.max(0, STATE.CONTEXT.keyframes.tabs);
  }
  const isAtKeyframes = isKeyframes_(line.get());

  let IS_IF_OR_ELSE_ = isIfOrElse(line.get());
  let isIfOrElseAProp = false;
  if (STATE.CONTEXT.keyframes.is && IS_IF_OR_ELSE_) {
    IS_IF_OR_ELSE_ = false;
    isIfOrElseAProp = true;
    STATE.CONTEXT.tabs = STATE.CONTEXT.keyframes.tabs + STATE.CONFIG.tabSize;
  }
  if (IS_IF_OR_ELSE_ && !STATE.CONTEXT.keyframes.is && isElse(line.get())) {
    isIfOrElseAProp = true;
    IS_IF_OR_ELSE_ = false;
    STATE.CONTEXT.tabs = Math.max(0, STATE.CONTEXT.currentTabs - STATE.CONFIG.tabSize);
  }
  return {
    isIfOrElseAProp,
    isAtKeyframes,
    isAtKeyframesPoint: isPointCheck,
  };
}
