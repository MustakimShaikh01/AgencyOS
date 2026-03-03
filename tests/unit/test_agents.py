import pytest
import asyncio
from app.agents import AGENT_REGISTRY
from app.db.models import Task, Agent
from app.core.decision_engine import decision_engine

@pytest.mark.asyncio
async def test_all_agents_registered():
    """Ensure all 9 required MVP agents exist in registry."""
    required = ["strategist", "content_writer", "approver", "risk_agent", "finance_controller", "seo_agent", "ads_manager", "social_manager"]
    
    for agent in required:
        assert agent in AGENT_REGISTRY, f"Missing {agent} in registry!"

@pytest.mark.asyncio
async def test_agent_validation():
    """Test JSON schemas logic."""
    writer = AGENT_REGISTRY["content_writer"]
    
    # Valid
    valid_data = {
        "analysis_summary": "Test",
        "draft_content": "Content",
        "self_review_notes": "Good.",
        "confidence_score": 0.9
    }
    assert await writer.validate_output(valid_data) is True
    
    # Invalid
    invalid_data = {"analysis_summary": "Test", "confidence_score": 1}
    assert await writer.validate_output(invalid_data) is False

def test_decision_engine_rules():
    """Test business rules evaluating outputs."""
    t = Task()
    
    # Rule 1: High Risk blocks
    state, msg = decision_engine.evaluate("risk", {"risk_score": 75}, t)
    assert state == "BLOCKED"
    
    # Rule 3: Low Approval scores trigger revision
    state, msg = decision_engine.evaluate("approver", {"approved": False, "overall_score": 60}, t)
    assert state == "REVISION"
    
    # Rule 2: Budget Overruns trigger Escalation 
    state, msg = decision_engine.evaluate("finance", {"overrun_percentage": 25.0}, t)
    assert state == "ESCALATED"

def test_xp_modifiers():
    """Test penalizing and rewarding XP on Agents."""
    a = Agent(name="test_writer", xp=100, authority_level=1)
    
    # Rule: First pass approval (+15)
    decision_engine.apply_xp_modifications(a, "first_pass_approval")
    assert a.xp == 115
    
    # Rule: Failed Revisions limit (-10)
    decision_engine.apply_xp_modifications(a, "down_limit_revisions")
    assert a.xp == 105
    
    # Rule 9: Max XP Promote
    a.xp = 495
    decision_engine.apply_xp_modifications(a, "first_pass_approval") # 495 + 15 = 510 -> Level up!
    assert a.authority_level == 2
    assert a.xp == 0 # Resets after promote
