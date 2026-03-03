from .base_agent import BaseAgent
from .strategist import StrategistAgent
from .content_writer import ContentWriterAgent
from .approver import ApproverAgent
from .risk_agent import RiskAgent
from .finance_controller import FinanceControllerAgent
from .seo_agent import SEOAgent
from .ads_manager import AdsManagerAgent
from .social_manager import SocialManagerAgent

# Registry of all available agents
AGENT_REGISTRY = {
    "strategist": StrategistAgent(),
    "content_writer": ContentWriterAgent(),
    "approver": ApproverAgent(),
    "risk_agent": RiskAgent(),
    "finance_controller": FinanceControllerAgent(),
    "seo_agent": SEOAgent(),
    "ads_manager": AdsManagerAgent(),
    "social_manager": SocialManagerAgent(),
}

__all__ = [
    "BaseAgent",
    "StrategistAgent",
    "ContentWriterAgent",
    "ApproverAgent",
    "RiskAgent",
    "FinanceControllerAgent",
    "SEOAgent",
    "AdsManagerAgent",
    "SocialManagerAgent",
    "AGENT_REGISTRY"
]
