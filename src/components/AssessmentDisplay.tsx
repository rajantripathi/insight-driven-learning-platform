
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, CheckCircle, XCircle } from "lucide-react";
import { AssessmentFeedback } from "@/api/voiceAssistant";

interface AssessmentDisplayProps {
  assessment: AssessmentFeedback;
  showVoiceMode?: boolean;
}

export const AssessmentDisplay = ({ assessment, showVoiceMode }: AssessmentDisplayProps) => {
  const getAssessmentIcon = (assessment: AssessmentFeedback) => {
    if (assessment.understoodConcept) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (showVoiceMode) {
    return (
      <div className="mt-2 flex gap-1">
        <Badge variant="secondary" className="text-xs">
          <Brain className="h-3 w-3 mr-1" />
          Understanding: {assessment.understoodConcept ? 'Good' : 'Reviewing'}
        </Badge>
        <Badge variant="outline" className="text-xs">
          Engagement: {assessment.engagementLevel}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-blue-800">Learning Assessment</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={assessment.understoodConcept ? "default" : "secondary"} className="flex items-center gap-1">
            {getAssessmentIcon(assessment)}
            Understanding: {assessment.understoodConcept ? 'Good' : 'Needs Review'}
          </Badge>
          <Badge variant="outline">
            Engagement: {assessment.engagementLevel}
          </Badge>
          {assessment.needsMorePractice && (
            <Badge variant="destructive">Needs More Practice</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
