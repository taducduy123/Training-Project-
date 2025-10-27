from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
'''
validate incoming request data client ->API
control what data sent back API->client
'''

class TodoBase(BaseModel):#parent class
    """Base schema with common attributes"""
    title: str = Field(..., min_length=1, max_length=255, description="Todo title")
    description: Optional[str] = Field(None, max_length=1000, description="Todo description")
    is_completed: bool = Field(default=False, description="Completion status")

'''
'''
class TodoCreate(TodoBase): # inherit all for TodoBase
    """Schema for creating a new todo"""
    pass


class TodoUpdate(BaseModel):
    """Schema for updating an existing todo"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_completed: Optional[bool] = None


class TodoResponse(TodoBase):
    """Schema for todo responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)# allow to create directly ORM


class TodoListResponse(BaseModel):
    """Schema for list of todos"""
    total: int
    items: list[TodoResponse]
