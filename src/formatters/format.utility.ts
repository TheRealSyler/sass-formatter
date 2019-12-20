import { SassTextLine } from '..';

import { FormattingState } from '../state';
import { isKeyframePoint } from '../utility';
import { isIfOrElse, isElse, isKeyframes as isKeyframes_ } from 'suf-regex';

export function FormatSetTabs(STATE: FormattingState, headerStuff?: { offset: number; additionalTabs: number }) {
  if (headerStuff === undefined) {
    // § set Tabs Property
    if (STATE.CONTEXT.keyframes.is && STATE.LOCAL_CONTEXT.isKeyframesPoint) {
      STATE.CONTEXT.tabs = Math.max(0, STATE.CONTEXT.keyframes.tabs + STATE.CONFIG.tabSize);
    }
    if (STATE.LOCAL_CONTEXT.isIfOrElseAProp && STATE.CONTEXT.keyframes.is) {
      STATE.CONTEXT.tabs = STATE.CONTEXT.keyframes.tabs + STATE.CONFIG.tabSize * 2;
    } else if (STATE.LOCAL_CONTEXT.isIfOrElseAProp && !STATE.CONTEXT.keyframes.is) {
      STATE.CONTEXT.tabs = STATE.CONTEXT.currentTabs;
    }
  } else {
    //§ set Tabs Header Block
    if (STATE.LOCAL_CONTEXT.isKeyframes) {
      STATE.CONTEXT.keyframes.tabs = Math.max(
        0,
        STATE.LOCAL_CONTEXT.indentation.distance + headerStuff.offset + STATE.CONFIG.tabSize
      );
    }
    if (STATE.LOCAL_CONTEXT.ResetTabs) {
      STATE.CONTEXT.tabs = Math.max(0, STATE.LOCAL_CONTEXT.indentation.distance + headerStuff.offset);
      STATE.CONTEXT.currentTabs = STATE.CONTEXT.tabs;
    } else {
      STATE.CONTEXT.tabs = Math.max(
        0,
        STATE.LOCAL_CONTEXT.indentation.distance +
          headerStuff.offset +
          STATE.CONFIG.tabSize +
          headerStuff.additionalTabs
      );

      STATE.CONTEXT.currentTabs = STATE.CONTEXT.tabs;
    }
  }
}

export function FormatHandleLocalContext(line: SassTextLine, STATE: FormattingState) {
  const isPointCheck = isKeyframePoint(line.get(), STATE.CONTEXT.keyframes.is);
  if (STATE.CONTEXT.keyframes.is && isPointCheck) {
    STATE.CONTEXT.tabs = Math.max(0, STATE.CONTEXT.keyframes.tabs);
  }
  const isKeyframes = isKeyframes_(line.get());

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
    isIfOrElse: IS_IF_OR_ELSE_,
    isIfOrElseAProp,
    isKeyframes,
    isKeyframesPoint: isPointCheck
  };
}
