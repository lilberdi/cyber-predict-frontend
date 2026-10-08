interface ProbabilityBarProps {
  leftLabel: string;
  rightLabel: string;
  leftValue: number;
  rightValue: number;
}

export function ProbabilityBar({ leftLabel, rightLabel, leftValue, rightValue }: ProbabilityBarProps) {
  return (
    <div className="probability-bar">
      <div className="probability-bar__labels">
        <strong>{leftLabel} {leftValue}%</strong>
        <strong>{rightValue}% {rightLabel}</strong>
      </div>
      <div className="probability-bar__track">
        <span style={{ width: `${leftValue}%` }} />
      </div>
    </div>
  );
}
